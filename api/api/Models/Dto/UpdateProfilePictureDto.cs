namespace api.Models.Dto
{
    /// <summary>
    /// Data transfer object for updating a user's profile picture.
    /// </summary>
    public class UpdateProfilePictureDto
    {
        /// <summary>
        /// Gets or sets the base64-encoded image string for the profile picture (JPEG or PNG) or null to clear it.
        /// </summary>
        public string? ProfilePicture { get; set; }
    }
}