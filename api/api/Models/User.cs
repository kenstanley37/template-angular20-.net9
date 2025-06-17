namespace api.Models
{
    /// <summary>
    /// Represents a user in the authentication system.
    /// </summary>
    public class User
    {
        /// <summary>
        /// Gets or sets the unique identifier for the user.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the user's name.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the user's email address.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the hashed password for the user.
        /// </summary>
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether the user's email is verified.
        /// </summary>
        public bool IsEmailVerified { get; set; } = false;

        /// <summary>
        /// Gets or sets the email verification token.
        /// </summary>
        public string? EmailVerificationToken { get; set; }

        /// <summary>
        /// Gets or sets the Google ID for social login.
        /// </summary>
        public string? GoogleId { get; set; }

        /// <summary>
        /// Gets or sets the Facebook ID for social login.
        /// </summary>
        public string? FacebookId { get; set; }

        /// <summary>
        /// Gets or sets the URL or base64 string of the user's profile picture.
        /// </summary>
        public string? ProfilePicture { get; set; }
    }
}