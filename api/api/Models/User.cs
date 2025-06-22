using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the user's full name.
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the user's email address.
        /// </summary>
        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the hashed password for the user.
        /// </summary>
        [Required]
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

        /// <summary>
        /// Gets or sets the user's phone number.
        /// </summary>
        [Phone]
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Gets or sets the user's address.
        /// </summary>
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the user's bio or short description.
        /// </summary>
        [MaxLength(500)]
        public string? Bio { get; set; }

        /// <summary>
        /// Gets or sets the user's role (e.g., Admin, Customer).
        /// </summary>
        [MaxLength(50)]
        public string Role { get; set; } = "Customer";

        /// <summary>
        /// Gets or sets the date and time when the user was created.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Gets or sets the date and time when the user was last updated.
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Number of consecutive failed login attempts.
        /// </summary>
        public int FailedLoginAttempts { get; set; } = 0;

        /// <summary>
        /// Timestamp of the last failed login attempt.
        /// </summary>
        public DateTime? LastFailedLoginAt { get; set; }

        /// <summary>
        /// Lockout end time if user is temporarily locked out due to failed login attempts.
        /// </summary>
        public DateTime? LockoutEnd { get; set; }

        /// <summary>
        /// Last login IP address.
        /// </summary>
        public string? LastLoginIp { get; set; }

        /// <summary>
        /// Last login user agent string.
        /// </summary>
        public string? LastLoginUserAgent { get; set; }

    }
}
