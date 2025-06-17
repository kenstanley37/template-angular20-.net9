namespace api.Models.Dto
{
    /// <summary>
    /// Data transfer object for social media login credentials.
    /// </summary>
    public class SocialLoginDto
    {
        /// <summary>
        /// Gets or sets the authentication token from the social media provider (e.g., Google or Facebook).
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether to keep the user logged in with a refresh token.
        /// </summary>
        public bool StayLoggedIn { get; set; }
    }
}