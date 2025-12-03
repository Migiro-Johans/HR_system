import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

@ApiTags('leave')
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiOperation({ summary: 'Create a leave request' })
  @ApiResponse({ status: 201, description: 'Leave request created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.create(createLeaveDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave requests' })
  @ApiResponse({ status: 200, description: 'Returns all leave requests' })
  findAll() {
    return this.leaveService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiResponse({ status: 200, description: 'Returns leave request details' })
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get leave requests for an employee' })
  @ApiResponse({ status: 200, description: 'Returns employee leave requests' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.leaveService.findByEmployee(employeeId);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve leave request' })
  @ApiResponse({ status: 200, description: 'Leave approved successfully' })
  approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.leaveService.approve(id, approvedBy);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject leave request' })
  @ApiResponse({ status: 200, description: 'Leave rejected successfully' })
  reject(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ) {
    return this.leaveService.reject(id, rejectionReason);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel leave request' })
  @ApiResponse({ status: 200, description: 'Leave cancelled successfully' })
  cancel(@Param('id') id: string) {
    return this.leaveService.cancel(id);
  }
}
