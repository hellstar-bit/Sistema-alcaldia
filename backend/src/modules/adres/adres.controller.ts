// backend/src/modules/adres/adres.controller.ts - VERSIÓN COMPLETA
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

  @Get('status')
  async getEPSPeriodoStatus(@Request() req: any) {
    console.log('📈 AdresController: GET /adres/status', {
      user: req.user?.email || 'No user',
    });

    try {
      const status = await this.adresService.getEPSPeriodoStatus();
      console.log('✅ AdresController: Estado EPS-Período obtenido:', status.length);
      
      return {
        success: true,
        message: 'Estado EPS-Período obtenido exitosamente',
        data: status
      };
    } catch (error) {
      console.error('❌ AdresController: Error al obtener estado:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

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

  @Get('stats')
  async getAdresStats(@Query() filters: AdresFilterDto, @Request() req: any) {
    console.log('📈 AdresController: GET /adres/stats', {
      user: req.user?.email || 'No user',
      filters,
    });

    try {
      const stats = await this.adresService.getAdresStats(filters);
      console.log('✅ AdresController: Estadísticas obtenidas:', stats);
      
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
        message: `Se eliminaron ${result.deletedCount} registros del período`,
        data: {
          deletedCount: result.deletedCount,
          epsId,
          periodoId
        }
      };
    } catch (error) {
      console.error('❌ AdresController: Error al eliminar datos del período:', error);
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() uploadDto: UploadExcelDto,
    @Request() req: any
  ) {
    console.log('📤 AdresController: POST /adres/upload', {
      user: req.user?.email || 'No user',
      hasFile: !!file,
      uploadDto,
    });

    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    const fileType = file.originalname!.split('.').pop()!.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
      throw new BadRequestException('El archivo debe ser Excel (.xlsx, .xls) o CSV (.csv)');
    }

    try {
      const result = await this.adresService.processFileUpload(
        file.buffer!,
        uploadDto.epsId,
        uploadDto.periodoId,
        uploadDto.selectedFields || []
      );

      console.log('✅ AdresController: Archivo procesado exitosamente:', result.processed);

      return {
        success: result.success,
        message: result.message,
        data: {
          processed: result.processed,
          errors: result.errors
        }
      };
    } catch (error) {
      console.error('❌ AdresController: Error al procesar archivo:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('export')
  async exportToExcel(@Query() filters: AdresFilterDto, @Res() res: Response, @Request() req: any) {
    console.log('📋 AdresController: GET /adres/export', {
      user: req.user?.email || 'No user',
      filters,
    });

    try {
      const buffer = await this.adresService.exportAdresToExcel(filters);
      
      const filename = `ADRES_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      console.error('❌ AdresController: Error al exportar:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }
}
