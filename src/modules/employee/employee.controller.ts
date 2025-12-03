import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('employees')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active employees' })
  @ApiResponse({ status: 200, description: 'Returns all active employees' })
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Returns employee details' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee details' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate employee' })
  @ApiResponse({ status: 200, description: 'Employee terminated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  terminate(@Param('id') id: string, @Body('dateLeft') dateLeft: Date) {
    return this.employeeService.terminate(id, dateLeft);
  }
}
