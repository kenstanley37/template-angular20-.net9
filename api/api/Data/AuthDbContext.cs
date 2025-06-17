using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Data
{
    /// <summary>
    /// Database context for authentication-related entities.
    /// </summary>
    public class AuthDbContext : DbContext
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AuthDbContext"/> class.
        /// </summary>
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }

        /// <summary>
        /// Gets or sets the users table.
        /// </summary>
        public DbSet<User> Users { get; set; }

        /// <summary>
        /// Gets or sets the refresh tokens table.
        /// </summary>
        public DbSet<RefreshToken> RefreshTokens { get; set; }
    }
}