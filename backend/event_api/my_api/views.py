from django.http import JsonResponse
from my_api.models import User, Event, Billet
from django.contrib.auth.hashers import make_password, check_password
import json
from rest_framework.decorators import api_view
from dotenv import load_dotenv
from os import environ, remove
import jwt
import qrcode
import base64
import pyotp
import uuid

load_dotenv()

def isAuthenticated(request):
    # get bearer token from request header
	token = request.headers.get('Authorization')
	if token is None:
		return False
	try:
		jwt.decode(token, environ["SECRET_KEY"], algorithms=["HS256"])
		user = User.objects.filter(token=token)
		if not user.exists():
			return False
		return True
	except:
		return False

@api_view(['GET'])
def userList(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if user is None:
		return JsonResponse({"message": "User not found!"})
	if not user.exists() or user.first().is_admin == False:
		return JsonResponse({"message": "You are not an admin!"}, status=403)
	users = User.objects.all()
	data = {"users": list(users.values())}
	return JsonResponse(data)

@api_view(['GET'])
def getSpecificUser(request, username):
	user = User.objects.filter(username=username)
	if user.exists():
		data = {"user": list(user.values())}
		return JsonResponse(data)
	return JsonResponse({"message": "User not found!"})

# we are receiving a POST request like this: {"username": "user1", "nom": "nom1", "prenom": "prenom1", "email": "email1", "telephone": "telephone1", "password": "password1"}
@api_view(['POST'])
def createUser(request):
	data = json.loads(request.body)
	username = data.get('username', '')
	nom = data.get('nom', '')
	prenom = data.get('prenom', '')
	email = data.get('email', '')
	telephone = data.get('telephone', '')
	password = data.get('password')
	is_organisateur = data.get('is_organisateur', False)
	if User.objects.filter(telephone=telephone).exists():
		return JsonResponse({"message": "User already exists!"})
	if not username or not nom or not prenom or not email or not telephone or not password:
		return JsonResponse({"message": "All fields are required!"})
	user = User.objects.filter(telephone=telephone)
	if user.exists():
		return JsonResponse({"message": "User already exists!"})
	user = User.objects.filter(email=email)
	if user.exists():
		return JsonResponse({"message": "User already exists!"})
	user = User.objects.filter(username=username)
	if user.exists():
		return JsonResponse({"message": "User already exists!"})
	user = User(username=username, nom=nom, prenom=prenom, email=email, telephone=telephone, password=make_password(password), is_admin=False, is_organisateur=is_organisateur)
	if user is None:
		return JsonResponse({"message": "User not created!"})
	user.save()
	return JsonResponse({"message": "User created!"})

@api_view(['POST'])
def toogle_twofa(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	user = user.first()
	if user.two_fa == False:
		user.two_fa = True
		user.save()
		secret = pyotp.random_base32()
		otp = pyotp.TOTP(secret)
		uri = otp.provisioning_uri(user.telephone, issuer_name="EventApp")
		user.two_fa_link = uri
		user.save()
		return JsonResponse({"message": "Two-factor authentication enabled!", "qr_code": uri})
	else:
		return JsonResponse({"message": "Two-factor authentication already enabled!"})

@api_view(['POST'])
def login(request):
	data = json.loads(request.body)
	telephone = data.get('telephone', '')
	password = data.get('password')
	if not telephone:
		return JsonResponse({"error": "Telephone is required!"})
	if not password:
		return JsonResponse({"error": "Password is required!"})
	user = User.objects.filter(telephone=telephone)
	if user.exists() and user.first().two_fa == False:
		user = user.first()
		if check_password(password, user.password):
			token = jwt.encode({"telephone ": telephone }, environ["SECRET_KEY"], algorithm="HS256")
			user.token = token.decode('utf-8')
			user.save()
			return JsonResponse({"message": "Login successful!", "token": token.decode('utf-8'), "username": user.username})
		return JsonResponse({"message": "Incorrect password!"})
	if user.exists() and user.first().two_fa == True:
		user = user.first()
		if check_password(password, user.password):
			return JsonResponse({"message": "Two FA required !","two_fa": "True"}, status=200)
		return JsonResponse({"message": "Incorrect password!"})
	return JsonResponse({"message": "User not found!"})

@api_view(['POST'])
def verify_twofa(request):
	data = json.loads(request.body)
	telephone = data.get('telephone', '')
	password = data.get('password')
	code = data.get('code')
	user = User.objects.filter(telephone=telephone)
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	user = user.first()
	if not check_password(password, user.password):
		return JsonResponse({"message": "Incorrect password!"})
	if user.two_fa == False:
		return JsonResponse({"message": "Two-factor authentication not enabled!"})
	try :
		otp = pyotp.parse_uri(user.two_fa_link)
	except:
		return JsonResponse({"message": "Invalid QR Code!"})
	if otp.verify(code):
		token = jwt.encode({"telephone ": telephone }, environ["SECRET_KEY"], algorithm="HS256")
		user.token = token.decode('utf-8')
		user.save()
		return JsonResponse({"message": "Login successful!", "token": token.decode('utf-8'), "username": user.username})
	return JsonResponse({"message": "Invalid token!"})

@api_view(['POST'])
def logout(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	token = request.headers.get('Authorization')
	user = User.objects.filter(token=token)
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	user.update(token='')
	return JsonResponse({"message": "Logout successful!"})

@api_view(['POST'])
def createEvent(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	data = json.loads(request.body)
	nom = data.get('nom', '')
	date = data.get('date', '')
	lieu = data.get('lieu', '')
	description = data.get('description', '')
	nb_billets = data.get('nb_billets', 0)
	prix = data.get('prix', 0.00)
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if user.first() is None:
		return JsonResponse({"message": "User not found!"})
	if not user.exists() or user.first().is_organisateur == False:
		user.update(is_organisateur=True)
	if not nom or not date or not date or not lieu or not description:
		return JsonResponse({"message": "All fields are required!"})
	print(f"User: {user.first()}")
	event = Event(nom=nom, date=date, lieu=lieu, description=description, organisateur=user.first(), nb_billets=nb_billets, billets_vendus=0, lien_image="", lien_video="", prix=prix)
	if event is None:
		return JsonResponse({"message": "Event not created!"})
	event.save()
	return JsonResponse({"message": "Event created!"})

@api_view(['GET'])
def eventList(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	events = Event.objects.all()
	data = {"events": list(events.values())}
	return JsonResponse(data)

@api_view(['GET'])
def getSpecificEvent(request, id):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	event = Event.objects.filter(id=id)
	if event.exists():
		data = {"event": list(event.values())}
		return JsonResponse(data)
	return JsonResponse({"message": "Event not found!"})

@api_view(['GET'])
def getEventsByUser(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if user.exists():
		user = user.first()
		events = user.liste_events.all()
		data = {"events": []}
		for event in events:
			qr_code_data = Billet.objects.filter(event=event, telephone=user)
			event_data = {
				"id": event.id,
				"nom": event.nom,
				"date": event.date,
				"lieu": event.lieu,
				"description": event.description,
				"organisateur": event.organisateur.username,
				"prix": event.prix,
				"qr_code_data": qr_code_data.first().qr_code_data
			}
			data["events"].append(event_data)
		return JsonResponse(data)
	return JsonResponse({"message": "User not found!"})

def getOrganisedEvents(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	if user.first().is_organisateur == False:
		return JsonResponse({"message": "You are not an organizer!"}, status=403)
	events = Event.objects.filter(organisateur=user.first())
	data = {"events": list(events.values())}
	return JsonResponse(data)

@api_view(['GET'])
def getQRCodeForEvent(request, id):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	event = Event.objects.filter(id=id)
	if not event.exists():
		return JsonResponse({"message": "Event not found!"})
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	if user.first() not in event.first().participants.all():
		return JsonResponse({"message": "User not in this event!"})
	qr_code = Billet.objects.filter(event=event.first(), telephone=user.first())
	if not qr_code.exists():
		return JsonResponse({"message": "QR Code not found!"})
	return JsonResponse({"qr_code": qr_code.first().qr_code_data})

def getMe(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	data = {"user": list(user.values())}
	return JsonResponse(data)

@api_view(['POST'])
def removeEvent(request, id):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	event = Event.objects.filter(id=id)
	if not event.exists():
		return JsonResponse({"message": "Event not found!"})
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if (not user.exists()):
		return JsonResponse({"message": "User not found!"})
	if event.first().organisateur == user.first():
		event.delete()
		return JsonResponse({"message": "Event deleted!"})
	return JsonResponse({"message": "You are not the organizer of this event!"}, status=403)

def create_qr_code(event, user):
	uuidd = str(uuid.uuid4())
	billet = Billet(qr_code_data=f"{event.id}_{user.telephone}_{uuidd}", event=event, telephone=user)
	billet.save()
	user.billets.add(billet)
	event.liste_billets.add(billet)
	event.billets_vendus += 1
	event.nb_billets -= 1
	event.save()
	return f"{event.id}_{user.telephone}_{uuidd}"

@api_view(['POST'])
def joinEvent(request, id):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	event = Event.objects.filter(id=id)
	if not event.exists():
		return JsonResponse({"message": "Event not found!"})
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	if event.first().nb_billets == 0:
		return JsonResponse({"message": "No more tickets available!"})
	if user.first().telephone == event.first().organisateur.telephone:
		return JsonResponse({"message": "You are the organizer of this event!"})
	if user.first() in event.first().participants.all():
		return JsonResponse({"message": "User already joined the event!"})
	event.first().participants.add(user.first())
	user.first().liste_events.add(event.first())
	qr_data = create_qr_code(event.first(), user.first())
	return JsonResponse({"message": "User joined event !", "qr_code": qr_data})

from django.http import JsonResponse
from rest_framework.decorators import api_view
import json

@api_view(['POST'])
def validateQRCode(request, id):
    if not isAuthenticated(request):
        return JsonResponse({"error": "You are not authenticated!"}, status=403)
    data = json.loads(request.body)	
    qrcode_data = data.get('qr_code_data', '')
    billet = Billet.objects.filter(qr_code_data=qrcode_data)
    if not billet.exists():
        return JsonResponse({"error": "Billet not found!"}, status=200)
    if billet.first().already_scanned:
        return JsonResponse({"error": "Billet already scanned!"}, status=200)
    billet.update(already_scanned=True)
    return JsonResponse({"message": "Billet scanned successfully!"}, status=200)


@api_view(['POST'])
def deleteBillet(request):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	data = json.loads(request.body)
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	if user.first().is_organisateur == False:
		return JsonResponse({"message": "You are not an organizer!"}, status=403)
	id = data.get('id')
	if not id:
		return JsonResponse({"message": "ID is required!"})
	billet = Billet.objects.filter(id=id)
	if not billet.exists():
		return JsonResponse({"message": "Billet not found!"})
	if billet.first().event.organisateur != user.first():
		return JsonResponse({"message": "You are not the organizer of this event!"}, status=403)
	billet.delete()
	event = Event.objects.filter(id=billet.first().event.id)
	event.update(billets_vendus=event.first().billets_vendus - 1)
	event.update(nb_billets=event.first().nb_billets + 1)
	event.first().participants.remove(billet.first().telephone)
	user.first().billets.remove(billet.first())
	user.first().liste_events.remove(event.first())
	event.save()
	user.save()
	return JsonResponse({"message": "Billet deleted!"})

def addUserToEvent(request, username):
	if not isAuthenticated(request):
		return JsonResponse({"message": "You are not authenticated!"}, status=403)
	user = User.objects.filter(token=request.headers.get('Authorization'))
	if not user.exists():
		return JsonResponse({"message": "User not found!"})
	if user.first().is_organisateur == False:
		return JsonResponse({"message": "You are not an organizer!"}, status=403)
	event = Event.objects.filter(id=id)
	if not event.exists():
		return JsonResponse({"message": "Event not found!"})
	user_to_add = User.objects.filter(username=username)
	if not user_to_add.exists():
		return JsonResponse({"message": "User to add not found!"})
	event.first().participants.add(user_to_add.first())
	event.first().liste_billets.add(user_to_add.first().billets.first())
	user_to_add.first().liste_events.add(event.first())
	event.save()
	user_to_add.save()
	return JsonResponse({"message": "User added to event!"})
