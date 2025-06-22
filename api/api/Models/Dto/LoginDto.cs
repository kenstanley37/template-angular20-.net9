using System.ComponentModel.DataAnnotations;

namespace api.Models.Dto
{
    /// <summary>
    /// Data transfer object for user login credentials.
    /// </summary>
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether to keep the user logged in.
        /// </summary>
        public bool StayLoggedIn { get; set; }
        public string DeviceId { get; set; } = string.Empty; // New device id
    }
}