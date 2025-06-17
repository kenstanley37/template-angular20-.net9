Template App for Angular 20 and .NET 9 Web Api

This application will showcase all of Angular's features, along with those of Angular Material.
The backend will handle JWT login along with social login ( Google, Facebook, etc ). Frontend config will be stored on the backend.

Current Features
*
*
*

Upcoming Features
* User Login and storage
* Theme selection
* 


Production Setup
Use a secret manager (e.g., Azure Key Vault) for enhanced security

Powershell

$env:ConnectionStrings__DefaultConnection="Server=your-server;Database=AuthDb;User Id=sa;Password=your-password;TrustServerCertificate=True"
$env:Jwt__Key="your-secure-key-here-32-chars-long"
$env:Jwt__Issuer="https://your-api-domain"
$env:Jwt__Audience="https://your-api-domain"
$env:Frontend__Url="https://your-frontend-domain"
$env:Api__BaseUrl="https://your-api-domain/api"

Linux/Mac (Bash):
Use double underscores (__) to denote nested configuration keys (e.g., Jwt__Key for Jwt:Key).

export ConnectionStrings__DefaultConnection="Server=your-server;Database=AuthDb;User Id=sa;Password=your-password;TrustServerCertificate=True"
export Jwt__Key="your-secure-key-here-32-chars-long"
export Jwt__Issuer="https://your-api-domain"
export Jwt__Audience="https://your-api-domain"
export Frontend__Url="https://your-frontend-domain"
export Api__BaseUrl="https://your-api-domain/api"