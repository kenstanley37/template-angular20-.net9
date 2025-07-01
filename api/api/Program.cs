using api.Data;
using api.Repositories;
using api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add controllers support (API endpoints)
            builder.Services.AddControllers();

            // Register IHttpClientFactory for making HTTP requests
            builder.Services.AddHttpClient();
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddOpenApi();
            //builder.Services.AddSwaggerGen();

            // Configure Entity Framework Core with SQL Server
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            builder.Services.AddDbContext<AuthDbContext>(options =>
                options.UseSqlServer(connectionString));

            // Token service for JWT and refresh token management
            builder.Services.AddScoped<iTokenService, TokenService>();
            builder.Services.AddHttpClient<TokenService>();
            // Register repository
            builder.Services.AddScoped<IImageRepository, ImageRepository>();

            // JWT Authentication configuration
            var jwtKey = builder.Configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt:Key not found.");
            var jwtIssuer = builder.Configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException("Jwt:Issuer not found.");
            var jwtAudience = builder.Configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException("Jwt:Audience not found.");
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtIssuer,

                        ValidateAudience = true,
                        ValidAudience = jwtAudience,

                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromMinutes(2), // allow slight clock drift

                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            // Read JWT from HttpOnly cookie
                            if (context.Request.Cookies.TryGetValue("auth_token", out var token))
                            {
                                context.Token = token;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });


            // Configure CORS to allow requests from frontend
            var frontEndUrl = builder.Configuration["Frontend:Url"]!;
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(frontEndUrl)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); // Allow cookies/auth headers
                });
            });

            var app = builder.Build();

            app.MapOpenApi();
            if (app.Environment.IsDevelopment())
            {
                app.UseSwaggerUI(options => // UseSwaggerUI is called only in Development.
                {
                    //options.SwaggerEndpoint("../openapi/v1.json", "v1");
                    options.SwaggerEndpoint("/openapi/v1.json", "v1");
                    //options.RoutePrefix = string.Empty;
                });
            }

            // Apply EF Core migrations at startup (development use)
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
                dbContext.Database.Migrate();
            }

            // Setup request pipeline
            app.UseHttpsRedirection();              // Redirect HTTP to HTTPS
            app.UseCors("AllowFrontend");           // Apply CORS policy
            app.UseAuthentication();                // Enable JWT auth
            app.UseAuthorization();                 // Enable role-based authorization
            app.MapControllers();                   // Map controller routes
            app.Run();                               // Start the app
        }
    }
}
