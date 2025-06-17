namespace api.Models
{
    /// <summary>
    /// Represents a refresh token for maintaining user sessions.
    /// </summary>
    public class RefreshToken
    {
        /// <summary>
        /// Gets or sets the unique identifier for the refresh token.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the ID of the associated user.
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Gets or sets the token value.
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the expiration date and time of the token.
        /// </summary>
        public DateTime Expires { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the token is revoked.
        /// </summary>
        public bool IsRevoked { get; set; }

        /// <summary>
        /// Gets or sets the associated user.
        /// </summary>
        public User User { get; set; } = null!;
    }
}