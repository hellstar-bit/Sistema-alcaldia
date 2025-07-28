// backend/src/modules/flujo/flujo.controller.ts
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
import { FlujoService } from './flujo.service';
import { CreateFlujoIpsDataDto } from './dto/create-flujo-ips-data.dto';
import { CreateFlujoEpsDataDto } from './dto/create-flujo-eps-data.dto';
import { FlujoFilterDto } from './dto/flujo-filter.dto';
import { UploadFlujoExcelDto } from './dto/upload-flujo-excel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('flujo')
@UseGuards(JwtAuthGuard)
export class FlujoController {
  constructor(private readonly flujoService: FlujoService) {}

  // ===============================================
  // ENDPOINTS PARA CONTROL DE CARGA
  // ===============================================
  @Get('control-carga')
  async getControlCargaGrid(@Request() req: any) {
    console.log('📊 FlujoController: GET /flujo/control-carga', {
      user: req.user?.email || 'No user',
    });

    try {
      const grid = await this.flujoService.getControlCargaGrid();
      
      return {
        success: true,
        message: 'Control de carga obtenido exitosamente',
        data: grid
      };
    } catch (error) {
      console.error('❌ FlujoController: Error al obtener control de carga:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ===============================================
  // ENDPOINTS PARA DATOS DE IPS
  // ===============================================
  @Get('ips-data')
async getFlujoIpsData(@Query() filters: FlujoFilterDto, @Request() req: any) {
  console.log('💰 FlujoController: GET /flujo/ips-data', {
    user: req.user?.email || 'No user',
    filters,
  });

  try {
    const result = await this.flujoService.getFlujoIpsData(filters);
    
    // ✅ CAMBIAR ESTA ESTRUCTURA:
    return {
      success: true,
      message: 'Datos de flujo IPS obtenidos exitosamente',
      data: {  // ← AGREGAR UN OBJETO "data" QUE CONTENGA:
        data: result.data,  // ← Los registros van en data.data
        pagination: {
          total: result.total,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: Math.ceil(result.total / (filters.limit || 10))
        },
        summary: {
          totalValorFacturado: result.totalValorFacturado,
          totalReconocido: result.totalReconocido,
          totalPagado: result.totalPagado,
          totalSaldoAdeudado: result.totalSaldoAdeudado
        }
      }
    };
  } catch (error) {
    console.error('❌ FlujoController: Error al obtener datos de flujo IPS:', error);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
}

  @Post('ips-data')
  async createFlujoIpsData(@Body() createDto: CreateFlujoIpsDataDto, @Request() req: any) {
    console.log('➕ FlujoController: POST /flujo/ips-data', {
      user: req.user?.email || 'No user',
      createDto,
    });

    try {
      const flujoIpsData = await this.flujoService.createFlujoIpsData(createDto);
      return {
        success: true,
        message: 'Datos de flujo IPS creados exitosamente',
        data: flujoIpsData
      };
    } catch (error) {
      console.error('❌ FlujoController: Error al crear datos de flujo IPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ===============================================
  // ENDPOINTS PARA DATOS DE EPS
  // ===============================================
  @Get('eps-data/:epsId/:periodoId')
  async getFlujoEpsData(
    @Param('epsId') epsId: string,
    @Param('periodoId') periodoId: string,
    @Request() req: any
  ) {
    console.log('📈 FlujoController: GET /flujo/eps-data/:epsId/:periodoId', {
      user: req.user?.email || 'No user',
      epsId,
      periodoId
    });

    try {
      const epsData = await this.flujoService.getFlujoEpsData(epsId, periodoId);
      
      return {
        success: true,
        message: 'Datos de flujo EPS obtenidos exitosamente',
        data: epsData
      };
    } catch (error) {
      console.error('❌ FlujoController: Error al obtener datos de flujo EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post('eps-data')
  async createOrUpdateFlujoEpsData(@Body() createDto: CreateFlujoEpsDataDto, @Request() req: any) {
    console.log('📝 FlujoController: POST /flujo/eps-data', {
      user: req.user?.email || 'No user',
      createDto,
    });

    try {
      const flujoEpsData = await this.flujoService.createOrUpdateFlujoEpsData(createDto);
      return {
        success: true,
        message: 'Datos de flujo EPS guardados exitosamente',
        data: flujoEpsData
      };
    } catch (error) {
      console.error('❌ FlujoController: Error al guardar datos de flujo EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ===============================================
  // ENDPOINTS PARA ELIMINAR DATOS
  // ===============================================
  @Delete('data/periodo/:epsId/:periodoId')
  async deleteFlujoPeriodoData(
    @Param('epsId') epsId: string, 
    @Param('periodoId') periodoId: string, 
    @Request() req: any
  ) {
    console.log('🗑️ FlujoController: DELETE /flujo/data/periodo/:epsId/:periodoId', {
      user: req.user?.email || 'No user',
      epsId,
      periodoId
    });

    try {
      const result = await this.flujoService.deleteFlujoPeriodoData(epsId, periodoId);
      
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
      console.error('❌ FlujoController: Error al eliminar datos del período:', error);
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
    console.log('📄 FlujoController: GET /flujo/plantilla', {
      user: req.user?.email || 'No user',
    });

    try {
      const buffer = await this.flujoService.generatePlantillaExcel();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Plantilla_Flujo.xlsx"',
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      console.error('❌ FlujoController: Error al generar plantilla:', error);
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
    @Body() uploadDto: UploadFlujoExcelDto,
    @Request() req: any
  ) {
    console.log('📤 FlujoController: POST /flujo/upload', {
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
      const result = await this.flujoService.processExcelUpload(
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
      console.error('❌ FlujoController: Error al procesar Excel:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('export')
  async exportToExcel(@Query() filters: FlujoFilterDto, @Res() res: Response, @Request() req: any) {
    console.log('📋 FlujoController: GET /flujo/export', {
      user: req.user?.email || 'No user',
      filters,
    });

    try {
      const buffer = await this.flujoService.exportFlujoToExcel(filters);
      
      const filename = `Flujo_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      console.error('❌ FlujoController: Error al exportar:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }
}
