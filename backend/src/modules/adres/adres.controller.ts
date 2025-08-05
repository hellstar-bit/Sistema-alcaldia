// backend/src/modules/adres/adres.controller.ts - VERSIÓN COMPLETA Y CORREGIDA
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
import { AdresService } from './adres.service';
import { CreateAdresDataDto } from './dto/create-adres-data.dto';
import { AdresFilterDto } from './dto/adres-filter.dto';
import { UploadExcelDto } from './dto/upload-excel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('adres')
@UseGuards(JwtAuthGuard)
export class AdresController {
  constructor(private readonly adresService: AdresService) {}

  // ✅ ENDPOINT PARA OBTENER TODAS LAS EPS
  @Get('eps')
  async getAllEPS(@Request() req: any) {
    console.log('📊 AdresController: GET /adres/eps', {
      user: req.user?.email || 'No user',
    });

    try {
      const eps = await this.adresService.getAllEPS();
      console.log('✅ AdresController: EPS obtenidas exitosamente:', eps.length);
      
      return {
        success: true,
        message: 'EPS obtenidas exitosamente',
        data: eps
      };
    } catch (error) {
      console.error('❌ AdresController: Error al obtener EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
  @Get('plantilla')
  async downloadPlantilla(@Res() res: Response, @Request() req: any) {
    console.log('📄 AdresController: GET /adres/plantilla', {
      user: req.user?.email || 'No user',
    });

    try {
      const buffer = await this.adresService.generatePlantillaExcel();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Plantilla_ADRES.xlsx"',
        'Content-Length': buffer.length,
      });

      console.log('✅ AdresController: Plantilla generada exitosamente');
      res.send(buffer);
    } catch (error) {
      console.error('❌ AdresController: Error al generar plantilla:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }
  // ✅ ENDPOINT PARA OBTENER TODOS LOS PERÍODOS
  @Get('periodos')
  async getAllPeriodos(@Request() req: any) {
    console.log('📅 AdresController: GET /adres/periodos', {
      user: req.user?.email || 'No user',
    });

    try {
      const periodos = await this.adresService.getAllPeriodos();
      console.log('✅ AdresController: Períodos obtenidos exitosamente:', periodos.length);
      
      return {
        success: true,
        message: 'Períodos obtenidos exitosamente',
        data: periodos
      };
    } catch (error) {
      console.error('❌ AdresController: Error al obtener períodos:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT CLAVE: OBTENER ESTADO EPS-PERÍODO PARA INDICADORES VISUALES
  @Get('status')
  @Get('status')
async getEPSPeriodoStatus(@Request() req: any) {
  console.log('📈 AdresController: GET /adres/status', {
    user: req.user?.email || 'No user',
  });

  try {
    const status = await this.adresService.getEPSPeriodoStatus();
    
    // 🔍 DEBUG: Log completo de la respuesta
    console.log('✅ AdresController: Estado EPS-Período obtenido:', status.length);
    console.log('🔍 DEBUG CONTROLLER: Full status array:', JSON.stringify(status, null, 2));
    console.log('🔍 DEBUG CONTROLLER: Sample item structure:', {
      sampleItem: status[0],
      allKeys: status[0] ? Object.keys(status[0]) : 'no items',
      types: status[0] ? {
        epsId: typeof status[0].epsId,
        periodoId: typeof status[0].periodoId,
        tieneData: typeof status[0].tieneData,
        totalRegistros: typeof status[0].totalRegistros
      } : 'no items'
    });
    
    const response = {
      success: true,
      message: 'Estado EPS-Período obtenido exitosamente',
      data: status
    };

    console.log('🔍 DEBUG CONTROLLER: Final response structure:', {
      success: response.success,
      message: response.message,
      dataLength: response.data.length,
      dataStructure: response.data[0] ? Object.keys(response.data[0]) : 'no data'
    });
    
    return response;
  } catch (error) {
    console.error('❌ AdresController: Error al obtener estado:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}

  // ✅ ENDPOINT PARA OBTENER DATOS DE ADRES CON FILTROS
  @Get('data')
  async getAdresData(@Query() filters: AdresFilterDto, @Request() req: any) {
    console.log('💰 AdresController: GET /adres/data', {
      user: req.user?.email || 'No user',
      filters,
    });

    try {
      const result = await this.adresService.getAdresData(filters);
      console.log('✅ AdresController: Datos de ADRES obtenidos:', {
        recordsFound: result.data.length,
        total: result.total,
        totalValorGirado: result.totalValorGirado
      });
      
      // ✅ SIEMPRE retornar success: true si no hay errores
      return {
        success: true, // ✅ IMPORTANTE: Siempre true si la query fue exitosa
        message: result.data.length > 0 
          ? 'Datos de ADRES obtenidos exitosamente' 
          : 'No se encontraron datos para los filtros especificados',
        data: {
          data: result.data,
          pagination: {
            total: result.total,
            page: filters.page || 1,
            limit: filters.limit || 10,
            totalPages: Math.ceil(result.total / (filters.limit || 10))
          },
          summary: {
            totalValorGirado: result.totalValorGirado
          }
        }
      };
    } catch (error) {
      console.error('❌ AdresController: Error al obtener datos de ADRES:', error);
      // ✅ SOLO retornar success: false en caso de error real
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA CREAR DATOS DE ADRES
  @Post('data')
  async createAdresData(@Body() createDto: CreateAdresDataDto, @Request() req: any) {
    console.log('➕ AdresController: POST /adres/data', {
      user: req.user?.email || 'No user',
      createDto,
    });

    try {
      const adresData = await this.adresService.createAdresData(createDto);
      return {
        success: true,
        message: 'Datos de ADRES creados exitosamente',
        data: adresData
      };
    } catch (error) {
      console.error('❌ AdresController: Error al crear datos de ADRES:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA OBTENER ESTADÍSTICAS
  @Get('stats')
  async getAdresStats(@Query() filters: AdresFilterDto, @Request() req: any) {
    console.log('📊 AdresController: GET /adres/stats', {
      user: req.user?.email || 'No user',
      filters,
    });

    try {
      const stats = await this.adresService.getAdresStats(filters);
      return {
        success: true,
        message: 'Estadísticas de ADRES obtenidas exitosamente',
        data: stats
      };
    } catch (error) {
      console.error('❌ AdresController: Error al obtener estadísticas:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA SUBIR ARCHIVO EXCEL
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadExcelDto,
    @Request() req: any
  ) {
    console.log('📤 AdresController: POST /adres/upload', {
      user: req.user?.email || 'No user',
      fileName: file?.originalname,
      fileSize: file?.size,
      uploadDto,
    });

    try {
      if (!file) {
        throw new BadRequestException('No se ha proporcionado ningún archivo');
      }

      const result = await this.adresService.uploadExcel(file, uploadDto.epsId, uploadDto.periodoId);
      
      return {
        success: true,
        message: `Archivo procesado exitosamente. ${result.processed} registros procesados${
          result.errors.length > 0 ? ` con ${result.errors.length} errores` : ''
        }`,
        data: result
      };
    } catch (error) {
      console.error('❌ AdresController: Error al subir archivo:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA EXPORTAR A EXCEL
  @Get('export')
  async exportToExcel(@Query() filters: AdresFilterDto, @Res() res: Response, @Request() req: any) {
    console.log('📋 AdresController: GET /adres/export', {
      user: req.user?.email || 'No user',
      filters,
    });

    try {
      const buffer = await this.adresService.exportAdresToExcel(filters);
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="adres_export_${new Date().toISOString().slice(0, 10)}.xlsx"`,
        'Content-Length': buffer.length,
      });

      console.log('✅ AdresController: Exportación completada');
      res.end(buffer);
    } catch (error) {
      console.error('❌ AdresController: Error al exportar:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  // ✅ ENDPOINT PARA ELIMINAR DATOS POR PERÍODO
  @Delete('data/periodo/:epsId/:periodoId')
  async deleteAdresDataByPeriodo(
    @Param('epsId') epsId: string,
    @Param('periodoId') periodoId: string,
    @Request() req: any
  ) {
    console.log('🗑️ AdresController: DELETE /adres/data/periodo/:epsId/:periodoId', {
      user: req.user?.email || 'No user',
      epsId,
      periodoId
    });

    try {
      const result = await this.adresService.deleteAdresDataByPeriodo(epsId, periodoId);
      
      return {
        success: true,
        message: `Datos eliminados exitosamente. ${result.deletedCount} registros eliminados`,
        data: {
          deletedCount: result.deletedCount,
          epsId,
          periodoId
        }
      };
    } catch (error) {
      console.error('❌ AdresController: Error al eliminar datos:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA ELIMINAR UN REGISTRO ESPECÍFICO
  @Delete('data/:id')
  async deleteAdresData(@Param('id') id: string, @Request() req: any) {
    console.log('🗑️ AdresController: DELETE /adres/data/:id', {
      user: req.user?.email || 'No user',
      adresDataId: id
    });

    try {
      await this.adresService.deleteAdresData(id);
      
      return {
        success: true,
        message: 'Registro eliminado exitosamente',
        data: { deletedId: id }
      };
    } catch (error) {
      console.error('❌ AdresController: Error al eliminar registro:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA ACTUALIZAR DATOS DE ADRES
  @Post('data/:id')
  async updateAdresData(
    @Param('id') id: string,
    @Body() updateDto: CreateAdresDataDto,
    @Request() req: any
  ) {
    console.log('📝 AdresController: POST /adres/data/:id', {
      user: req.user?.email || 'No user',
      adresDataId: id,
      updateDto
    });

    try {
      const adresData = await this.adresService.updateAdresData(id, updateDto);
      
      return {
        success: true,
        message: 'Datos de ADRES actualizados exitosamente',
        data: adresData
      };
    } catch (error) {
      console.error('❌ AdresController: Error al actualizar datos:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA VALIDAR DATOS DE EXCEL ANTES DE SUBIR
  @Post('validate-excel')
  @UseInterceptors(FileInterceptor('file'))
  async validateExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadExcelDto,
    @Request() req: any
  ) {
    console.log('🔍 AdresController: POST /adres/validate-excel', {
      user: req.user?.email || 'No user',
      fileName: file?.originalname,
      fileSize: file?.size,
      uploadDto,
    });

    try {
      if (!file) {
        throw new BadRequestException('No se ha proporcionado ningún archivo');
      }

      const result = await this.adresService.validateExcel(file, uploadDto.epsId, uploadDto.periodoId);
      
      return {
        success: true,
        message: 'Archivo validado exitosamente',
        data: result
      };
    } catch (error) {
      console.error('❌ AdresController: Error al validar archivo:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA OBTENER RESUMEN DE DATOS POR EPS
  @Get('summary/:epsId')
  async getAdresSummaryByEPS(
    @Param('epsId') epsId: string,
    @Request() req: any
  ) {
    console.log('📈 AdresController: GET /adres/summary/:epsId', {
      user: req.user?.email || 'No user',
      epsId
    });

    try {
      const summary = await this.adresService.getAdresSummaryByEPS(epsId);
      
      return {
        success: true,
        message: 'Resumen de ADRES obtenido exitosamente',
        data: summary
      };
    } catch (error) {
      console.error('❌ AdresController: Error al obtener resumen:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT PARA OBTENER TENDENCIAS POR PERÍODO
  @Get('trends')
  async getAdresTrends(@Query() filters: AdresFilterDto, @Request() req: any) {
    console.log('📊 AdresController: GET /adres/trends', {
      user: req.user?.email || 'No user',
      filters
    });

    try {
      const trends = await this.adresService.getAdresTrends(filters);
      
      return {
        success: true,
        message: 'Tendencias de ADRES obtenidas exitosamente',
        data: trends
      };
    } catch (error) {
      console.error('❌ AdresController: Error al obtener tendencias:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // ✅ ENDPOINT DE HEALTH CHECK PARA EL MÓDULO ADRES
  @Get('health')
  async healthCheck(@Request() req: any) {
    console.log('🏥 AdresController: GET /adres/health', {
      user: req.user?.email || 'No user',
      timestamp: new Date().toISOString()
    });

    try {
      const health = await this.adresService.getHealthStatus();
      
      return {
        success: true,
        message: 'Módulo ADRES funcionando correctamente',
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          module: 'adres',
          version: '1.0.0',
          details: health
        }
      };
    } catch (error) {
      console.error('❌ AdresController: Error en health check:', error);
      return {
        success: false,
        message: 'Error en el módulo ADRES',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }
}