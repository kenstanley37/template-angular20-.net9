namespace api.Models
{
    public class LoginAttempt
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;

        public bool Success { get; set; }

        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
