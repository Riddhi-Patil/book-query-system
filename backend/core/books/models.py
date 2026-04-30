from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    description = models.TextField()
    url = models.URLField(null=True, blank=True)

    summary = models.TextField(null=True, blank=True)
    genre = models.CharField(max_length=100, null=True, blank=True)
    embedding = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.title