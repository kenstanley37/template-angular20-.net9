namespace api.Models.Dto
{
    /// <summary>
    /// Data transfer object for JWT token.
    /// </summary>
    public class JwtTokenDto
    {
        /// <summary>
        /// Gets or sets the JWT token string.
        /// </summary>
        public string Token { get; set; } = string.Empty;
    }
}