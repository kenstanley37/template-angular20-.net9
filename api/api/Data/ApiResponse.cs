namespace api.Data
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public int StatusCode { get; set; }

        public static ApiResponse<T> Ok(T data, string? message = null) =>
            new() { Success = true, Data = data, Message = message, StatusCode = 200 };

        public static ApiResponse<T> Error(string message, int statusCode = 400) =>
            new() { Success = false, Message = message, StatusCode = statusCode };
    }
}
