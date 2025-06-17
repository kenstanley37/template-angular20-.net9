namespace api.Models.Dto
{
    /// <summary>
    /// Data transfer object for user login credentials.
    /// </summary>
    public class LoginDto
    {
        /// <summary>
        /// Gets or sets the user's email address.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the user's password.
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether to keep the user logged in.
        /// </summary>
        public bool StayLoggedIn { get; set; }
    }
}