using api.Models;
using Microsoft.AspNetCore.Mvc;
using static api.Models.TokenPayloads;

namespace api.Services
{
    public interface iTokenService
    {
        string GenerateJwtToken(User user);
        Task<RefreshToken> GenerateRefreshToken(User user, string deviceId);
        string ValidateJwtToken(string token);
        Task<FacebookTokenPayload?> ValidateFacebookToken(string token);
        CookieOptions GetAuthCookieOptions();
        CookieOptions GetRefreshCookieOptions();
        //Task<RefreshToken> TryRefreshToken(string refreshToken);
    }
}
