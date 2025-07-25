// backend/src/modules/cartera/cartera.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseInterceptors, 
  UploadedFile, 
  Res,
  BadRequestException,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CarteraService } from './cartera.service';
import { CreateCarteraDataDto } from './dto/create-cartera-data.dto';
import { CarteraFilterDto } from './dto/cartera-filter.dto';
import { UploadExcelDto } from './dto/upload-excel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cartera')
@UseGuards(JwtAuthGuard)
export class CarteraController {
  constructor(private readonly carteraService: CarteraService) {}

  // ===============================================
  // ENDPOINTS PARA EPS
  // ===============================================
  @Get('eps')
  async getAllEPS() {
    try {
      const eps = await this.carteraService.getAllEPS();
      return {
        success: true,
        message: 'EPS obtenidas exitosamente',
        data: eps
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ===============================================
  // ENDPOINTS PARA PERÍODOS
  // ===============================================
  @Get('periodos')
  async getAllPeriodos() {
    try {
      const periodos = await this.carteraService.getAllPeriodos();
      return {
        success: true,
        message: 'Períodos obtenidos exitosamente',
        data: periodos
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post('periodos/initialize')
  async initializePeriodos() {
    try {
      await this.carteraService.initializePeriodos();
      return {
        success: true,
        message: 'Períodos inicializados exitosamente',
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ===============================================
  // ENDPOINTS PARA IPS
  // ===============================================
  @Get('ips')
  async getAllIPS() {
    try {
      const ips = await this.carteraService.getAllIPS();
      return {
        success: true,
        message: 'IPS obtenidas exitosamente',
        data: ips
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ===============================================
  // ENDPOINTS PARA DATOS DE CARTERA
  // ===============================================
  @Get('data')
  async getCarteraData(@Query() filters: CarteraFilterDto) {
    try {
      const result = await this.carteraService.getCarteraData(filters);
      return {
        success: true,
        message: 'Datos de cartera obtenidos exitosamente',
        data: result.data,
        pagination: {
          total: result.total,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: Math.ceil(result.total / (filters.limit || 10))
        },
        summary: {
          totalCartera: result.totalCartera
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post('data')
  async createCarteraData(@Body() createDto: CreateCarteraDataDto) {
    try {
      const carteraData = await this.carteraService.createCarteraData(createDto);
      return {
        success: true,
        message: 'Datos de cartera creados exitosamente',
        data: carteraData
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('status')
  async getEPSPeriodoStatus() {
    try {
      const status = await this.carteraService.getEPSPeriodoStatus();
      return {
        success: true,
        message: 'Estado EPS-Período obtenido exitosamente',
        data: status
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ===============================================
  // ENDPOINTS PARA EXCEL
  // ===============================================
  @Get('plantilla')
  async downloadPlantilla(@Res() res: Response) {
    try {
      const buffer = await this.carteraService.generatePlantillaExcel();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Plantilla_Cartera.xlsx"',
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadExcelDto
  ) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('El archivo debe ser de formato Excel (.xlsx o .xls)');
    }

    try {
      const result = await this.carteraService.processExcelUpload(
        file.buffer,
        uploadDto.epsId,
        uploadDto.periodoId
      );

      return {
        success: result.success,
        message: result.message,
        data: {
          processed: result.processed,
          errors: result.errors
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('export')
  async exportToExcel(@Query() filters: CarteraFilterDto, @Res() res: Response) {
    try {
      const buffer = await this.carteraService.exportCarteraToExcel(filters);
      
      const filename = `Cartera_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }
}