// inherting from the built in error class of javascript
class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        // 👉 This calls the built-in Error class.
        // It gives your object:
        // message
        // stack (basic error info)

        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}

// we write this code to handle the error in a better way. 
// we can use this class to throw the error in our controllers and then 
// we can handle the error in our error middleware.
//  we can also use this class to send the error 
// response to the client in a better way.

// throw new ApiError(400, "Invalid email or password", [{field: "email", message: "Email is required"}])