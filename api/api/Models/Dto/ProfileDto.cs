namespace api.Models.Dto
{
    /// <summary>
    /// Data transfer object for user profile information.
    /// </summary>
    public class ProfileDto
    {
        /// <summary>
        /// Gets or sets the user's unique identifier.
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
        /// Gets or sets the URL or base64 string of the user's profile picture.
        /// </summary>
        public string? ProfilePicture { get; set; }
    }
}