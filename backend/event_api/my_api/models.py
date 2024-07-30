from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    telephone = models.CharField(max_length=100, unique=True, primary_key=True)
    password = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    liste_events = models.ManyToManyField('Event', related_name='users')
    billets = models.ManyToManyField('Billet', related_name='users', db_table='user_billets')
    is_admin = models.BooleanField(default=False)
    is_organisateur = models.BooleanField(default=False)
    token = models.CharField(max_length=3000, default='')
    two_fa = models.BooleanField(default=False)
    two_fa_link = models.CharField(max_length=100, default='')

    def __str__(self):
        return self.nom

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin

class Event(models.Model):
	id = models.AutoField(primary_key=True)
	nom = models.CharField(max_length=100)
	date = models.CharField(max_length=100)
	lieu = models.CharField(max_length=100)
	description = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	organisateur = models.ForeignKey('User', on_delete=models.CASCADE, related_name='organised_events')
	prix = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	liste_billets = models.ManyToManyField('Billet', related_name='events', db_table='event_billets')
	nb_billets = models.IntegerField()
	billets_vendus = models.IntegerField()
	lien_image = models.CharField(max_length=100)
	lien_video = models.CharField(max_length=100)
	participants = models.ManyToManyField('User', related_name='participated_events', db_table='event_participants')

	def __str__(self):
		return self.nom

class Billet(models.Model):
	id = models.AutoField(primary_key=True)
	qr_code_data = models.TextField()
	event = models.ForeignKey('Event', on_delete=models.CASCADE, related_name='billets')
	already_scanned = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	telephone = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_billets')

	def __str__(self):
		return str(self.id)

