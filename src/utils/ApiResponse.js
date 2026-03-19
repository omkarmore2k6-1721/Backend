class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}
// we use constructors to create the object of the class.
//And also when we sernd response we create object of the class by using new keyword and send it to the client.
export { ApiResponse }


// Without ApiResponse
// res.status(200).json({
//     message: "User fetched",
//     data: user
// });

// With ApiResponse
// res.status(200).json(
//     new ApiResponse(200, user, "User fetched")
// );