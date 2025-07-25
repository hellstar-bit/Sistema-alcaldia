// backend/src/modules/cartera/services/ips.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPS } from '../entities/ips.entity';
import { CreateIPSDto, UpdateIPSDto, IPSFilterDto } from '../dto/ips.dto';

@Injectable()
export class IPSService {
  constructor(
    @InjectRepository(IPS)
    private ipsRepository: Repository<IPS>,
  ) {}

  async getAllIPS(filters: IPSFilterDto = {}): Promise<{
    data: IPS[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.ipsRepository
      .createQueryBuilder('ips')
      .leftJoinAndSelect('ips.eps', 'eps');

    // Filtros
    if (filters.search) {
      queryBuilder.andWhere(
        '(ips.nombre ILIKE :search OR ips.codigo ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.soloActivas !== undefined) {
      queryBuilder.andWhere('ips.activa = :activa', { activa: filters.soloActivas });
    }

    if (filters.tipoServicio) {
      queryBuilder.andWhere('ips.tipoServicio = :tipoServicio', { 
        tipoServicio: filters.tipoServicio 
      });
    }

    if (filters.epsId) {
      queryBuilder.andWhere('eps.id = :epsId', { epsId: filters.epsId });
    }

    if (filters.sinAsignar) {
      queryBuilder.andWhere('eps.id IS NULL');
    }

    // Ordenamiento
    const orderBy = filters.orderBy || 'nombre';
    const orderDirection = filters.orderDirection || 'ASC';
    queryBuilder.orderBy(`ips.${orderBy}`, orderDirection);

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const total = await queryBuilder.getCount();
    
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getIPSById(id: string): Promise<IPS> {
    const ips = await this.ipsRepository.findOne({
      where: { id },
      relations: ['eps']
    });

    if (!ips) {
      throw new NotFoundException(`IPS con ID ${id} no encontrada`);
    }

    return ips;
  }

  async createIPS(createDto: CreateIPSDto): Promise<IPS> {
    // Verificar si ya existe una IPS con el mismo nombre
    const existingByName = await this.ipsRepository.findOne({
      where: { nombre: createDto.nombre }
    });

    if (existingByName) {
      throw new ConflictException(`Ya existe una IPS con el nombre "${createDto.nombre}"`);
    }

    // Generar código si no se proporciona
    let codigo = createDto.codigo;
    if (!codigo) {
      codigo = this.generateIPSCode(createDto.nombre);
    }

    // Verificar si ya existe una IPS con el mismo código
    const existingByCode = await this.ipsRepository.findOne({
      where: { codigo }
    });

    if (existingByCode) {
      throw new ConflictException(`Ya existe una IPS con el código "${codigo}"`);
    }

    const ips = this.ipsRepository.create({
      ...createDto,
      codigo
    });

    return await this.ipsRepository.save(ips);
  }

  async updateIPS(id: string, updateDto: UpdateIPSDto): Promise<IPS> {
    const ips = await this.getIPSById(id);

    // Verificar conflictos de nombre (si se está cambiando)
    if (updateDto.nombre && updateDto.nombre !== ips.nombre) {
      const existingByName = await this.ipsRepository.findOne({
        where: { nombre: updateDto.nombre }
      });

      if (existingByName) {
        throw new ConflictException(`Ya existe una IPS con el nombre "${updateDto.nombre}"`);
      }
    }

    // Verificar conflictos de código (si se está cambiando)
    if (updateDto.codigo && updateDto.codigo !== ips.codigo) {
      const existingByCode = await this.ipsRepository.findOne({
        where: { codigo: updateDto.codigo }
      });

      if (existingByCode) {
        throw new ConflictException(`Ya existe una IPS con el código "${updateDto.codigo}"`);
      }
    }

    Object.assign(ips, updateDto);
    return await this.ipsRepository.save(ips);
  }

  async deleteIPS(id: string): Promise<void> {
    const ips = await this.getIPSById(id);

    // Verificar si tiene datos de cartera asociados
    const hasCarteraData = await this.ipsRepository
      .createQueryBuilder('ips')
      .leftJoin('ips.carteraData', 'cartera')
      .where('ips.id = :id', { id })
      .andWhere('cartera.id IS NOT NULL')
      .getCount();

    if (hasCarteraData > 0) {
      throw new BadRequestException(
        'No se puede eliminar la IPS porque tiene datos de cartera asociados. ' +
        'Primero elimina los datos de cartera o desactiva la IPS.'
      );
    }

    await this.ipsRepository.remove(ips);
  }

  async toggleIPSStatus(id: string): Promise<IPS> {
    const ips = await this.getIPSById(id);
    ips.activa = !ips.activa;
    return await this.ipsRepository.save(ips);
  }

  async getIPSByEPS(epsId: string): Promise<IPS[]> {
    return await this.ipsRepository
      .createQueryBuilder('ips')
      .leftJoin('ips.eps', 'eps')
      .where('eps.id = :epsId', { epsId })
      .getMany();
  }

  async getUnassignedIPS(): Promise<IPS[]> {
    return await this.ipsRepository
      .createQueryBuilder('ips')
      .leftJoin('ips.eps', 'eps')
      .where('eps.id IS NULL')
      .andWhere('ips.activa = :activa', { activa: true })
      .orderBy('ips.nombre', 'ASC')
      .getMany();
  }

  // Método para encontrar o crear IPS (para compatibilidad con sistema existente)
  async findOrCreateIPS(nombre: string, codigo?: string): Promise<IPS> {
    let ips = await this.ipsRepository.findOne({
      where: { nombre }
    });

    if (!ips) {
      ips = await this.createIPS({
        nombre,
        codigo: codigo || this.generateIPSCode(nombre),
        activa: true
      });
    }

    return ips;
  }

  private generateIPSCode(nombre: string): string {
    // Generar código basado en el nombre
    const cleanName = nombre
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
    
    const timestamp = Date.now().toString().slice(-4);
    return `${cleanName}_${timestamp}`;
  }

  async getIPSStats(): Promise<{
    total: number;
    activas: number;
    inactivas: number;
    asignadas: number;
    sinAsignar: number;
    porTipoServicio: { [key: string]: number };
  }> {
    const [total, activas, asignadas] = await Promise.all([
      this.ipsRepository.count(),
      this.ipsRepository.count({ where: { activa: true } }),
      this.ipsRepository
        .createQueryBuilder('ips')
        .leftJoin('ips.eps', 'eps')
        .where('eps.id IS NOT NULL')
        .getCount()
    ]);

    // Obtener estadísticas por tipo de servicio
    const tiposServicio = await this.ipsRepository
      .createQueryBuilder('ips')
      .select('ips.tipoServicio', 'tipo')
      .addSelect('COUNT(*)', 'cantidad')
      .where('ips.tipoServicio IS NOT NULL')
      .groupBy('ips.tipoServicio')
      .getRawMany();

    const porTipoServicio = tiposServicio.reduce((acc, item) => {
      acc[item.tipo] = parseInt(item.cantidad);
      return acc;
    }, {});

    return {
      total,
      activas,
      inactivas: total - activas,
      asignadas,
      sinAsignar: total - asignadas,
      porTipoServicio
    };
  }
}