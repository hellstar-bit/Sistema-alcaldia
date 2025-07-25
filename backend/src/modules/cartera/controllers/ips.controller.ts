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
  Patch,
  ValidationPipe,
  UsePipes,
  BadRequestException
} from '@nestjs/common';
import { IPSService } from '../services/ips.service';
import { CreateIPSDto, UpdateIPSDto, IPSFilterDto } from '../dto/ips.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('ips')
@UseGuards(JwtAuthGuard)
export class IPSController {
  constructor(private readonly ipsService: IPSService) {}

  @Get()
  async getAllIPS(@Query() rawQuery: any, @Request() req: any) {
    console.log('🏥 IPSController: GET /ips - RAW QUERY:', rawQuery);

    try {
      // Transformación manual para evitar problemas de validación
      const filters: IPSFilterDto = {};

      // Procesar search
      if (rawQuery.search && typeof rawQuery.search === 'string') {
        filters.search = rawQuery.search;
      }

      // Procesar soloActivas
      if (rawQuery.soloActivas !== undefined && rawQuery.soloActivas !== null) {
        if (typeof rawQuery.soloActivas === 'string') {
          filters.soloActivas = rawQuery.soloActivas.toLowerCase() === 'true';
        } else if (typeof rawQuery.soloActivas === 'boolean') {
          filters.soloActivas = rawQuery.soloActivas;
        }
      }

      // Procesar sinAsignar
      if (rawQuery.sinAsignar !== undefined && rawQuery.sinAsignar !== null) {
        if (typeof rawQuery.sinAsignar === 'string') {
          filters.sinAsignar = rawQuery.sinAsignar.toLowerCase() === 'true';
        } else if (typeof rawQuery.sinAsignar === 'boolean') {
          filters.sinAsignar = rawQuery.sinAsignar;
        }
      }

      // Procesar tipoServicio
      if (rawQuery.tipoServicio && typeof rawQuery.tipoServicio === 'string') {
        filters.tipoServicio = rawQuery.tipoServicio;
      }

      // Procesar epsId
      if (rawQuery.epsId && typeof rawQuery.epsId === 'string') {
        filters.epsId = rawQuery.epsId;
      }

      // Procesar orderBy
      if (rawQuery.orderBy && typeof rawQuery.orderBy === 'string') {
        const validOrderBy = ['nombre', 'codigo', 'createdAt'];
        if (validOrderBy.includes(rawQuery.orderBy)) {
          filters.orderBy = rawQuery.orderBy as 'nombre' | 'codigo' | 'createdAt';
        }
      }

      // Procesar orderDirection
      if (rawQuery.orderDirection && typeof rawQuery.orderDirection === 'string') {
        const validDirections = ['ASC', 'DESC'];
        if (validDirections.includes(rawQuery.orderDirection.toUpperCase())) {
          filters.orderDirection = rawQuery.orderDirection.toUpperCase() as 'ASC' | 'DESC';
        }
      }

      // Procesar page
      if (rawQuery.page !== undefined && rawQuery.page !== null) {
        const page = parseInt(String(rawQuery.page), 10);
        if (!isNaN(page) && page > 0) {
          filters.page = page;
        }
      }

      // Procesar limit
      if (rawQuery.limit !== undefined && rawQuery.limit !== null) {
        const limit = parseInt(String(rawQuery.limit), 10);
        if (!isNaN(limit) && limit > 0 && limit <= 10000) {
          filters.limit = limit;
        }
      }

      console.log('🏥 IPSController: PROCESSED FILTERS:', {
        user: req.user?.email || 'No user',
        filters,
        filtersTypes: {
          soloActivas: typeof filters.soloActivas,
          sinAsignar: typeof filters.sinAsignar,
          page: typeof filters.page,
          limit: typeof filters.limit
        }
      });

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
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error al procesar la solicitud',
        data: null
      });
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
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error al obtener estadísticas',
        data: null
      });
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
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error al obtener IPS sin asignar',
        data: null
      });
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
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error al obtener IPS',
        data: null
      });
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
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error al crear IPS',
        data: null
      });
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
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error al actualizar IPS',
        data: null
      });
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
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error al eliminar IPS',
        data: null
      });
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
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error al cambiar estado',
        data: null
      });
    }
  }
}