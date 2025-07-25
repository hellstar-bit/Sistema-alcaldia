// backend/src/modules/cartera/controllers/eps.controller.ts - CORREGIDO
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  Patch
} from '@nestjs/common';
import { EPSService } from '../services/eps.service';
import { CreateEPSDto, UpdateEPSDto, EPSFilterDto, AssignIPSToEPSDto } from '../dto/eps.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('eps')
@UseGuards(JwtAuthGuard)
export class EPSController {
  constructor(private readonly epsService: EPSService) {}

  @Get()
  async getAllEPS(@Query() filters: EPSFilterDto, @Request() req: any) {
    console.log('🏢 EPSController: GET /eps', {
      user: req.user?.email || 'No user',
      filters
    });

    try {
      const result = await this.epsService.getAllEPS(filters);
      console.log('✅ EPSController: EPS obtenidas:', result.data.length);
      
      return {
        success: true,
        message: 'EPS obtenidas exitosamente',
        data: {
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          }
        }
      };
    } catch (error) {
      console.error('❌ EPSController: Error al obtener EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('stats')
  async getEPSStats(@Request() req: any) {
    console.log('📊 EPSController: GET /eps/stats', {
      user: req.user?.email || 'No user'
    });

    try {
      const stats = await this.epsService.getEPSStats();
      return {
        success: true,
        message: 'Estadísticas de EPS obtenidas exitosamente',
        data: stats
      };
    } catch (error) {
      console.error('❌ EPSController: Error al obtener estadísticas:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get(':id')
  async getEPSById(@Param('id') id: string, @Request() req: any) {
    console.log('🔍 EPSController: GET /eps/:id', {
      user: req.user?.email || 'No user',
      epsId: id
    });

    try {
      const eps = await this.epsService.getEPSById(id);
      return {
        success: true,
        message: 'EPS obtenida exitosamente',
        data: eps
      };
    } catch (error) {
      console.error('❌ EPSController: Error al obtener EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post()
  async createEPS(@Body() createDto: CreateEPSDto, @Request() req: any) {
    console.log('➕ EPSController: POST /eps', {
      user: req.user?.email || 'No user',
      createDto
    });

    try {
      const eps = await this.epsService.createEPS(createDto);
      console.log('✅ EPSController: EPS creada:', eps.id);
      
      return {
        success: true,
        message: 'EPS creada exitosamente',
        data: eps
      };
    } catch (error) {
      console.error('❌ EPSController: Error al crear EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Put(':id')
  async updateEPS(@Param('id') id: string, @Body() updateDto: UpdateEPSDto, @Request() req: any) {
    console.log('✏️ EPSController: PUT /eps/:id', {
      user: req.user?.email || 'No user',
      epsId: id,
      updateDto
    });

    try {
      const eps = await this.epsService.updateEPS(id, updateDto);
      return {
        success: true,
        message: 'EPS actualizada exitosamente',
        data: eps
      };
    } catch (error) {
      console.error('❌ EPSController: Error al actualizar EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Delete(':id')
  async deleteEPS(@Param('id') id: string, @Request() req: any) {
    console.log('🗑️ EPSController: DELETE /eps/:id', {
      user: req.user?.email || 'No user',
      epsId: id
    });

    try {
      await this.epsService.deleteEPS(id);
      return {
        success: true,
        message: 'EPS eliminada exitosamente',
        data: null
      };
    } catch (error) {
      console.error('❌ EPSController: Error al eliminar EPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Patch(':id/toggle-status')
  async toggleEPSStatus(@Param('id') id: string, @Request() req: any) {
    console.log('🔄 EPSController: PATCH /eps/:id/toggle-status', {
      user: req.user?.email || 'No user',
      epsId: id
    });

    try {
      const eps = await this.epsService.toggleEPSStatus(id);
      return {
        success: true,
        message: `EPS ${eps.activa ? 'activada' : 'desactivada'} exitosamente`,
        data: eps
      };
    } catch (error) {
      console.error('❌ EPSController: Error al cambiar estado:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post(':id/assign-ips')
  async assignIPSToEPS(@Param('id') id: string, @Body() assignDto: Omit<AssignIPSToEPSDto, 'epsId'>, @Request() req: any) {
    console.log('🔗 EPSController: POST /eps/:id/assign-ips', {
      user: req.user?.email || 'No user',
      epsId: id,
      ipsIds: assignDto.ipsIds
    });

    try {
      const eps = await this.epsService.assignIPSToEPS({
        epsId: id,
        ipsIds: assignDto.ipsIds
      });
      
      return {
        success: true,
        message: 'IPS asignadas exitosamente',
        data: eps
      };
    } catch (error) {
      console.error('❌ EPSController: Error al asignar IPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get(':id/ips')
  async getIPSByEPS(@Param('id') id: string, @Request() req: any) {
    console.log('🏥 EPSController: GET /eps/:id/ips', {
      user: req.user?.email || 'No user',
      epsId: id
    });

    try {
      const ips = await this.epsService.getIPSByEPS(id);
      return {
        success: true,
        message: 'IPS asignadas obtenidas exitosamente',
        data: ips
      };
    } catch (error) {
      console.error('❌ EPSController: Error al obtener IPS asignadas:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Delete(':epsId/ips/:ipsId')
  async removeIPSFromEPS(@Param('epsId') epsId: string, @Param('ipsId') ipsId: string, @Request() req: any) {
    console.log('🔗 EPSController: DELETE /eps/:epsId/ips/:ipsId', {
      user: req.user?.email || 'No user',
      epsId,
      ipsId
    });

    try {
      const eps = await this.epsService.removeIPSFromEPS(epsId, ipsId);
      return {
        success: true,
        message: 'IPS removida de la EPS exitosamente',
        data: eps
      };
    } catch (error) {
      console.error('❌ EPSController: Error al remover IPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
}