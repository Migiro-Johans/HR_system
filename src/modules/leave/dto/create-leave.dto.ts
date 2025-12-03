import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveDto {
  @ApiProperty({ example: 'uuid-of-employee' })
  @IsString()
  employeeId: string;

  @ApiProperty({
    example: 'annual',
    enum: ['annual', 'sick', 'maternity', 'paternity', 'unpaid'],
  })
  @IsEnum(['annual', 'sick', 'maternity', 'paternity', 'unpaid'])
  leaveType: string;

  @ApiProperty({ example: '2024-12-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-05' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Family emergency', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
