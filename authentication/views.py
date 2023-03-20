from typing import TYPE_CHECKING

from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

if TYPE_CHECKING:
    from rest_framework.request import Request


class LoginView(ObtainAuthToken):
    """
    A view for authenticating a user and returning an auth token.

    Inherits from ObtainAuthToken to provide token-based authentication for
    users. This view returns a token for a successfully authenticated user.
    """

    def post(self, request: "Request", *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user": {
                    "username": user.username,
                },
            }
        )


class LogoutView(APIView):
    """
    A view for logging out a user.

    Provides an endpoint for logging out a user by deleting the user's auth
    token. The user must be authenticated to access this endpoint.
    """

    def post(self, request: "Request", *args, **kwargs) -> Response:
        """
        Handles HTTP POST requests to the logout endpoint.
        Deletes the user's auth token to log them out.
        """

        request.user.auth_token.delete()
        return Response(status=HTTP_200_OK)
