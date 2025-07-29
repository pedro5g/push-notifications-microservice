import { ErrorCode, HTTP_STATUS } from './constraints';
import {
  AppError,
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from './exceptions';

describe('[Exceptions] unit tests', () => {
  test('AppError', () => {
    let sut: AppError = new AppError('AppError test');

    expect(sut).instanceof(AppError);

    expect(sut.message).toStrictEqual('AppError test');
    expect(sut.statusCode).toStrictEqual(500);
    expect(sut.errorCode).toBeFalsy();

    sut = new AppError(
      'AppError test 2',
      HTTP_STATUS.OK,
      ErrorCode.ACCESS_FORBIDDEN
    );

    expect(sut.message).toStrictEqual('AppError test 2');
    expect(sut.statusCode).toStrictEqual(HTTP_STATUS.OK);
    expect(sut.errorCode).toStrictEqual(ErrorCode.ACCESS_FORBIDDEN);

    expect(sut).toStrictEqual(
      expect.objectContaining({
        message: 'AppError test 2',
        statusCode: HTTP_STATUS.OK,
        errorCode: ErrorCode.ACCESS_FORBIDDEN,
      })
    );
  });

  test('NotFoundException', () => {
    let sut: NotFoundException = new NotFoundException();

    expect(sut.message).toStrictEqual('Resource Not Found');
    expect(sut.statusCode).toStrictEqual(HTTP_STATUS.NOT_FOUND);
    expect(sut.errorCode).toStrictEqual(ErrorCode.RESOURCE_NOT_FOUND);

    sut = new NotFoundException('Email not found');

    expect(sut.message).toStrictEqual('Email not found');
    expect(sut.statusCode).toStrictEqual(HTTP_STATUS.NOT_FOUND);
    expect(sut.errorCode).toStrictEqual(ErrorCode.RESOURCE_NOT_FOUND);
  });

  test('BadRequestException', () => {
    const sut: BadRequestException = new BadRequestException();

    expect(sut.message).toStrictEqual('Bad Request');
    expect(sut.statusCode).toStrictEqual(HTTP_STATUS.BAD_REQUEST);
    expect(sut.errorCode).toStrictEqual(ErrorCode.BAD_REQUEST);
  });

  test('ConflictException', () => {
    const sut: ConflictException = new ConflictException();

    expect(sut.message).toStrictEqual('Conflict');
    expect(sut.statusCode).toStrictEqual(HTTP_STATUS.CONFLICT);
    expect(sut.errorCode).toStrictEqual(ErrorCode.ACTION_NOT_ALLOWED);
  });

  test('UnauthorizedException', () => {
    const sut: UnauthorizedException = new UnauthorizedException();

    expect(sut.message).toStrictEqual('Unauthorized Access');
    expect(sut.statusCode).toStrictEqual(HTTP_STATUS.UNAUTHORIZED);
    expect(sut.errorCode).toStrictEqual(ErrorCode.ACCESS_UNAUTHORIZED);
  });

  test('InternalServerException', () => {
    const sut: InternalServerException = new InternalServerException();

    expect(sut.message).toStrictEqual('Internal Server Error');
    expect(sut.statusCode).toStrictEqual(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(sut.errorCode).toStrictEqual(ErrorCode.INTERNAL_SERVER_ERROR);
  });

  test('HttpException', () => {
    const sut: HttpException = new HttpException();

    expect(sut.message).toStrictEqual('Http Exception Error');
    expect(sut.statusCode).toStrictEqual(500);
    expect(sut.errorCode).toBeFalsy();
  });
});
