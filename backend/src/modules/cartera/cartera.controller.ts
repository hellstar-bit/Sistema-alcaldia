// backend/src/modules/cartera/cartera.controller.ts - CON DEBUG AÑADIDO
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
  UseGuards,
  Request,
  Delete,
  Param
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
  async getAllEPS(@Request() req: any) {
    console.log('📊 CarteraController: GET /cartera/eps', {
      user: req.user?.email || 'No user',
      userId: req.user?.id || 'No ID',
    });

    try {
      const eps = await this.carteraService.getAllEPS();
      console.log('✅ CarteraController: EPS obtenidas exitosamente:', eps.length);
      
      return {
        success: true,
        message: 'EPS obtenidas exitosamente',
        data: eps
      };
    } catch (error) {
      console.error('❌ CarteraController: Error al obtener EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Delete('data/periodo/:epsId/:periodoId')
async deleteCarteraDataByPeriodo(
  @Param('epsId') epsId: string, 
  @Param('periodoId') periodoId: string, 
  @Request() req: any
) {
  console.log('🗑️ CarteraController: DELETE /cartera/data/periodo/:epsId/:periodoId', {
    user: req.user?.email || 'No user',
    epsId,
    periodoId
  });

  try {
    const result = await this.carteraService.deleteCarteraDataByPeriodo(epsId, periodoId);
    
    return {
      success: true,
      message: `Se eliminaron ${result.deletedCount} registros del período`,
      data: {
        deletedCount: result.deletedCount,
        epsId,
        periodoId
      }
    };
  } catch (error) {
    console.error('❌ CarteraController: Error al eliminar datos del período:', error);
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
  async getAllPeriodos(@Request() req: any) {
    console.log('📅 CarteraController: GET /cartera/periodos', {
      user: req.user?.email || 'No user',
    });

    try {
      const periodos = await this.carteraService.getAllPeriodos();
      console.log('✅ CarteraController: Períodos obtenidos exitosamente:', periodos.length);
      
      return {
        success: true,
        message: 'Períodos obtenidos exitosamente',
        data: periodos
      };
    } catch (error) {
      console.error('❌ CarteraController: Error al obtener períodos:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post('periodos/initialize')
  async initializePeriodos(@Request() req: any) {
    console.log('🔧 CarteraController: POST /cartera/periodos/initialize', {
      user: req.user?.email || 'No user',
    });

    try {
      await this.carteraService.initializePeriodos();
      return {
        success: true,
        message: 'Períodos inicializados exitosamente',
        data: null
      };
    } catch (error) {
      console.error('❌ CarteraController: Error al inicializar períodos:', error);
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
  async getAllIPS(@Request() req: any) {
    console.log('🏥 CarteraController: GET /cartera/ips', {
      user: req.user?.email || 'No user',
    });

    try {
      const ips = await this.carteraService.getAllIPS();
      console.log('✅ CarteraController: IPS obtenidas exitosamente:', ips.length);
      
      return {
        success: true,
        message: 'IPS obtenidas exitosamente',
        data: ips
      };
    } catch (error) {
      console.error('❌ CarteraController: Error al obtener IPS:', error);
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
  async getCarteraData(@Query() filters: CarteraFilterDto, @Request() req: any) {
    console.log('💰 CarteraController: GET /cartera/data', {
      user: req.user?.email || 'No user',
      filters,
    });

    try {
      const result = await this.carteraService.getCarteraData(filters);
      console.log('✅ CarteraController: Datos de cartera obtenidos:', result.data.length);
      
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
      console.error('❌ CarteraController: Error al obtener datos de cartera:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post('data')
  async createCarteraData(@Body() createDto: CreateCarteraDataDto, @Request() req: any) {
    console.log('➕ CarteraController: POST /cartera/data', {
      user: req.user?.email || 'No user',
      createDto,
    });

    try {
      const carteraData = await this.carteraService.createCarteraData(createDto);
      return {
        success: true,
        message: 'Datos de cartera creados exitosamente',
        data: carteraData
      };
    } catch (error) {
      console.error('❌ CarteraController: Error al crear datos de cartera:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('status')
  async getEPSPeriodoStatus(@Request() req: any) {
    console.log('📈 CarteraController: GET /cartera/status', {
      user: req.user?.email || 'No user',
    });

    try {
      const status = await this.carteraService.getEPSPeriodoStatus();
      console.log('✅ CarteraController: Estado EPS-Período obtenido:', status.length);
      
      return {
        success: true,
        message: 'Estado EPS-Período obtenido exitosamente',
        data: status
      };
    } catch (error) {
      console.error('❌ CarteraController: Error al obtener estado:', error);
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
  async downloadPlantilla(@Res() res: Response, @Request() req: any) {
    console.log('📄 CarteraController: GET /cartera/plantilla', {
      user: req.user?.email || 'No user',
    });

    try {
      const buffer = await this.carteraService.generatePlantillaExcel();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Plantilla_Cartera.xlsx"',
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      console.error('❌ CarteraController: Error al generar plantilla:', error);
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
    @Body() uploadDto: UploadExcelDto,
    @Request() req: any
  ) {
    console.log('📤 CarteraController: POST /cartera/upload', {
      user: req.user?.email || 'No user',
      hasFile: !!file,
      uploadDto,
    });

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

      console.log('✅ CarteraController: Excel procesado exitosamente:', result.processed);

      return {
        success: result.success,
        message: result.message,
        data: {
          processed: result.processed,
          errors: result.errors
        }
      };
    } catch (error) {
      console.error('❌ CarteraController: Error al procesar Excel:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('export')
  async exportToExcel(@Query() filters: CarteraFilterDto, @Res() res: Response, @Request() req: any) {
    console.log('📋 CarteraController: GET /cartera/export', {
      user: req.user?.email || 'No user',
      filters,
    });

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
      console.error('❌ CarteraController: Error al exportar:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }
}