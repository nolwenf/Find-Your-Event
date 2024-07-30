from django.urls import path
from my_api import views

urlpatterns = [
	path('users/', views.userList), # GET ALL USERS
	path('users/create', views.createUser), # CREATE USER
    path('users/me', views.getMe), # GET CURRENT USER
	path('users/<str:username>', views.getSpecificUser), # GET SPECIFIC USER BY USERNAME
	path('auth/login', views.login), # LOGIN
	path('auth/logout', views.logout), # LOGOUT
	path('auth/toogle_twofa', views.toogle_twofa), # TOOGLE 2FA
	path('auth/verify_twofa', views.verify_twofa), # VERIFY 2FA
	path('events/', views.getEventsByUser), # GET ALL EVENTS FOR A USER
    path('events/all', views.eventList), # GET ALL EVENTS
    path('events/organised', views.getOrganisedEvents), # GET ALL EVENTS ORGANISED BY USER
	path('events/create', views.createEvent), # CREATE EVENT
	path('event/<int:id>', views.getSpecificEvent), # GET SPECIFIC EVENT BY ID
	path('event/remove/<int:id>', views.removeEvent), # REMOVE EVENT
	path('event/join/<int:id>', views.joinEvent), # JOIN EVENT
	path('event/<int:id>/validate', views.validateQRCode), # VALIDATE BILLET
	path('event/<int:id>/qr_code', views.getQRCodeForEvent), # GET QR CODE FOR EVENT FOR USER
	path('event/add/<str:username>', views.addUserToEvent), # ADD USER TO EVENT
	path('billet/delete/<int:id>', views.deleteBillet), # DELETE BILLET
]
