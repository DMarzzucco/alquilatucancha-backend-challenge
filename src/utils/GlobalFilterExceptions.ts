import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { FastifyReply } from "fastify";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

    catch(exception: any, host: ArgumentsHost) {
        
        const context = host.switchToHttp();
        const response = context.getResponse<FastifyReply>()

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR

        const message = exception instanceof HttpException
            ? (exception.getResponse() as string | object)
            : (exception as Error).message || "internal server error";

        response.status(status).send({
            statusCode: status,
            message: message
        })
    }
}