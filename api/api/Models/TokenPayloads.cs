using System.Text.Json.Serialization;

namespace api.Models
{
    /// <summary>
    /// Contains payload classes for social media authentication tokens.
    /// </summary>
    public class TokenPayloads
    {
        /// <summary>
        /// Represents a Google authentication token payload.
        /// </summary>
        public class GoogleTokenPayload
        {
            [JsonPropertyName("email")]
            public string? Email { get; set; }

            [JsonPropertyName("sub")]
            public string? Sub { get; set; }

            [JsonPropertyName("name")]
            public string? Name { get; set; }

            [JsonPropertyName("picture")]
            public string? Picture { get; set; }
        }

        /// <summary>
        /// Represents a Facebook authentication token payload.
        /// </summary>
        public class FacebookTokenPayload
        {
            [JsonPropertyName("email")]
            public string? Email { get; set; }

            [JsonPropertyName("id")]
            public string? Id { get; set; }

            [JsonPropertyName("name")]
            public string? Name { get; set; }

            [JsonPropertyName("picture")]
            public PictureData? Picture { get; set; }
        }

        /// <summary>
        /// Represents picture data in a Facebook token payload.
        /// </summary>
        public class PictureData
        {
            [JsonPropertyName("data")]
            public PictureUrl? Data { get; set; }
        }

        /// <summary>
        /// Represents the URL of a picture in a Facebook token payload.
        /// </summary>
        public class PictureUrl
        {
            [JsonPropertyName("url")]
            public string? Url { get; set; }
        }

        /// <summary>
        /// Represents a Facebook debug token response.
        /// </summary>
        public class FacebookDebugTokenResponse
        {
            [JsonPropertyName("data")]
            public FacebookDebugTokenData? Data { get; set; }
        }

        /// <summary>
        /// Represents data in a Facebook debug token response.
        /// </summary>
        public class FacebookDebugTokenData
        {
            [JsonPropertyName("is_valid")]
            public bool IsValid { get; set; }
        }
    }
}