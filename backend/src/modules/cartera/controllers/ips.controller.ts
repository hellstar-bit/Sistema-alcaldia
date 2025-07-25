// backend/src/modules/cartera/controllers/ips.controller.ts
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
import { IPSService } from '../services/ips.service';
import { CreateIPSDto, UpdateIPSDto, IPSFilterDto } from '../dto/ips.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { error } from 'console';

@Controller('ips')
@UseGuards(JwtAuthGuard)
export class IPSController {
  constructor(private readonly ipsService: IPSService) {}

  @Get()
  async getAllIPS(@Query() filters: IPSFilterDto, @Request() req: any) {
    console.log('🏥 IPSController: GET /ips', {
      user: req.user?.email || 'No user',
      filters
    });

    try {
      const result = await this.ipsService.getAllIPS(filters);
      console.log('✅ IPSController: IPS obtenidas:', result.data.length);
      
      return {
        success: true,
        message: 'IPS obtenidas exitosamente',
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
      console.error('❌ IPSController: Error al obtener IPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('stats')
  async getIPSStats(@Request() req: any) {
    console.log('📊 IPSController: GET /ips/stats', {
      user: req.user?.email || 'No user'
    });

    try {
      const stats = await this.ipsService.getIPSStats();
      return {
        success: true,
        message: 'Estadísticas de IPS obtenidas exitosamente',
        data: stats
      };
    } catch (error) {
      console.error('❌ IPSController: Error al obtener estadísticas:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get('unassigned')
  async getUnassignedIPS(@Request() req: any) {
    console.log('🔍 IPSController: GET /ips/unassigned', {
      user: req.user?.email || 'No user'
    });

    try {
      const ips = await this.ipsService.getUnassignedIPS();
      return {
        success: true,
        message: 'IPS sin asignar obtenidas exitosamente',
        data: ips
      };
    } catch (error) {
      console.error('❌ IPSController: Error al obtener IPS sin asignar:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Get(':id')
  async getIPSById(@Param('id') id: string, @Request() req: any) {
    console.log('🔍 IPSController: GET /ips/:id', {
      user: req.user?.email || 'No user',
      ipsId: id
    });

    try {
      const ips = await this.ipsService.getIPSById(id);
      return {
        success: true,
        message: 'IPS obtenida exitosamente',
        data: ips
      };
    } catch (error) {
      console.error('❌ IPSController: Error al obtener IPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post()
  async createIPS(@Body() createDto: CreateIPSDto, @Request() req: any) {
    console.log('➕ IPSController: POST /ips', {
      user: req.user?.email || 'No user',
      createDto
    });

    try {
      const ips = await this.ipsService.createIPS(createDto);
      console.log('✅ IPSController: IPS creada:', ips.id);
      
      return {
        success: true,
        message: 'IPS creada exitosamente',
        data: ips
      };
    } catch (error) {
      console.error('❌ IPSController: Error al crear IPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Put(':id')
  async updateIPS(@Param('id') id: string, @Body() updateDto: UpdateIPSDto, @Request() req: any) {
    console.log('✏️ IPSController: PUT /ips/:id', {
      user: req.user?.email || 'No user',
      ipsId: id,
      updateDto
    });

    try {
      const ips = await this.ipsService.updateIPS(id, updateDto);
      return {
        success: true,
        message: 'IPS actualizada exitosamente',
        data: ips
      };
    } catch (error) {
      console.error('❌ IPSController: Error al actualizar IPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Delete(':id')
  async deleteIPS(@Param('id') id: string, @Request() req: any) {
    console.log('🗑️ IPSController: DELETE /ips/:id', {
      user: req.user?.email || 'No user',
      ipsId: id
    });

    try {
      await this.ipsService.deleteIPS(id);
      return {
        success: true,
        message: 'IPS eliminada exitosamente',
        data: null
      };
    } catch (error) {
      console.error('❌ IPSController: Error al eliminar IPS:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Patch(':id/toggle-status')
  async toggleIPSStatus(@Param('id') id: string, @Request() req: any) {
    console.log('🔄 IPSController: PATCH /ips/:id/toggle-status', {
      user: req.user?.email || 'No user',
      ipsId: id
    });

    try {
      const ips = await this.ipsService.toggleIPSStatus(id);
      return {
        success: true,
        message: `IPS ${ips.activa ? 'activada' : 'desactivada'} exitosamente`,
        data: ips
      };
    } catch (error) {
      console.error('❌ IPSController: Error al cambiar estado:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
}error('❌ IPSController: Error al cambiar estado:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
}