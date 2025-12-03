import { IsString, IsEmail, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  employeeNumber: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0712345678' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  idNumber: string;

  @ApiProperty({ example: 'A001234567B' })
  @IsString()
  kraPin: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  nssfNumber?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  nhifNumber?: string;

  @ApiProperty({ example: 'Equity Bank', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiProperty({ example: '254712345678', required: false })
  @IsOptional()
  @IsString()
  mpesaNumber?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  basicSalary: number;

  @ApiProperty({ example: 15000, required: false })
  @IsOptional()
  @IsNumber()
  houseAllowance?: number;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  commuterAllowance?: number;

  @ApiProperty({ example: 2000, required: false })
  @IsOptional()
  @IsNumber()
  airtimeAllowance?: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  dateJoined: Date;
}
