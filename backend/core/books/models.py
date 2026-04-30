from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, null=True, blank=True)
    rating = models.FloatField(default=4.0)
    summary = models.TextField(null=True, blank=True)
    genre = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField()
    url = models.URLField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    embedding = models.JSONField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['title'], name='unique_book_title')
        ]

    def __str__(self):
        return self.title