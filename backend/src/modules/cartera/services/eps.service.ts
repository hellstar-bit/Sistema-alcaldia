// backend/src/modules/cartera/services/eps.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EPS } from '../entities/eps.entity';
import { IPS } from '../entities/ips.entity';
import { CreateEPSDto, UpdateEPSDto, EPSFilterDto, AssignIPSToEPSDto } from '../dto/eps.dto';

@Injectable()
export class EPSService {
  constructor(
    @InjectRepository(EPS)
    private epsRepository: Repository<EPS>,
    @InjectRepository(IPS)
    private ipsRepository: Repository<IPS>,
  ) {}

  async getAllEPS(filters: EPSFilterDto = {}): Promise<{
    data: EPS[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.epsRepository
      .createQueryBuilder('eps')
      .leftJoinAndSelect('eps.ipsAsignadas', 'ips');

    // Filtros
    if (filters.search) {
      queryBuilder.andWhere(
        '(eps.nombre ILIKE :search OR eps.codigo ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.soloActivas !== undefined) {
      queryBuilder.andWhere('eps.activa = :activa', { activa: filters.soloActivas });
    }

    // Ordenamiento
    const orderBy = filters.orderBy || 'nombre';
    const orderDirection = filters.orderDirection || 'ASC';
    queryBuilder.orderBy(`eps.${orderBy}`, orderDirection);

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

  async getEPSById(id: string): Promise<EPS> {
    const eps = await this.epsRepository.findOne({
      where: { id },
      relations: ['ipsAsignadas']
    });

    if (!eps) {
      throw new NotFoundException(`EPS con ID ${id} no encontrada`);
    }

    return eps;
  }

  async createEPS(createDto: CreateEPSDto): Promise<EPS> {
    // Verificar si ya existe una EPS con el mismo nombre
    const existingByName = await this.epsRepository.findOne({
      where: { nombre: createDto.nombre }
    });

    if (existingByName) {
      throw new ConflictException(`Ya existe una EPS con el nombre "${createDto.nombre}"`);
    }

    // Generar código si no se proporciona
    let codigo = createDto.codigo;
    if (!codigo) {
      codigo = this.generateEPSCode(createDto.nombre);
    }

    // Verificar si ya existe una EPS con el mismo código
    const existingByCode = await this.epsRepository.findOne({
      where: { codigo }
    });

    if (existingByCode) {
      throw new ConflictException(`Ya existe una EPS con el código "${codigo}"`);
    }

    const eps = this.epsRepository.create({
      ...createDto,
      codigo
    });

    return await this.epsRepository.save(eps);
  }

  async updateEPS(id: string, updateDto: UpdateEPSDto): Promise<EPS> {
    const eps = await this.getEPSById(id);

    // Verificar conflictos de nombre (si se está cambiando)
    if (updateDto.nombre && updateDto.nombre !== eps.nombre) {
      const existingByName = await this.epsRepository.findOne({
        where: { nombre: updateDto.nombre }
      });

      if (existingByName) {
        throw new ConflictException(`Ya existe una EPS con el nombre "${updateDto.nombre}"`);
      }
    }

    // Verificar conflictos de código (si se está cambiando)
    if (updateDto.codigo && updateDto.codigo !== eps.codigo) {
      const existingByCode = await this.epsRepository.findOne({
        where: { codigo: updateDto.codigo }
      });

      if (existingByCode) {
        throw new ConflictException(`Ya existe una EPS con el código "${updateDto.codigo}"`);
      }
    }

    Object.assign(eps, updateDto);
    return await this.epsRepository.save(eps);
  }

  async deleteEPS(id: string): Promise<void> {
    const eps = await this.getEPSById(id);

    // Verificar si tiene datos de cartera asociados
    const hasCarteraData = await this.epsRepository
      .createQueryBuilder('eps')
      .leftJoin('eps.carteraData', 'cartera')
      .where('eps.id = :id', { id })
      .andWhere('cartera.id IS NOT NULL')
      .getCount();

    if (hasCarteraData > 0) {
      throw new BadRequestException(
        'No se puede eliminar la EPS porque tiene datos de cartera asociados. ' +
        'Primero elimina los datos de cartera o desactiva la EPS.'
      );
    }

    await this.epsRepository.remove(eps);
  }

  async toggleEPSStatus(id: string): Promise<EPS> {
    const eps = await this.getEPSById(id);
    eps.activa = !eps.activa;
    return await this.epsRepository.save(eps);
  }

  async assignIPSToEPS(assignDto: AssignIPSToEPSDto): Promise<EPS> {
    const eps = await this.getEPSById(assignDto.epsId);

    // Verificar que todas las IPS existan
    const ipsEntities = await this.ipsRepository.find({
      where: { id: In(assignDto.ipsIds) }
    });

    if (ipsEntities.length !== assignDto.ipsIds.length) {
      const foundIds = ipsEntities.map(ips => ips.id);
      const notFoundIds = assignDto.ipsIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`IPS no encontradas: ${notFoundIds.join(', ')}`);
    }

    eps.ipsAsignadas = ipsEntities;
    return await this.epsRepository.save(eps);
  }

  async getIPSByEPS(epsId: string): Promise<IPS[]> {
    const eps = await this.getEPSById(epsId);
    return eps.ipsAsignadas || [];
  }

  async removeIPSFromEPS(epsId: string, ipsId: string): Promise<EPS> {
    const eps = await this.getEPSById(epsId);
    
    eps.ipsAsignadas = eps.ipsAsignadas.filter(ips => ips.id !== ipsId);
    
    return await this.epsRepository.save(eps);
  }

  // Método para encontrar o crear EPS (para compatibilidad con sistema existente)
  async findOrCreateEPS(nombre: string, codigo?: string): Promise<EPS> {
    let eps = await this.epsRepository.findOne({
      where: { nombre }
    });

    if (!eps) {
      eps = await this.createEPS({
        nombre,
        codigo: codigo || this.generateEPSCode(nombre),
        activa: true
      });
    }

    return eps;
  }

  private generateEPSCode(nombre: string): string {
    // Generar código basado en el nombre
    const cleanName = nombre
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
    
    const timestamp = Date.now().toString().slice(-4);
    return `${cleanName}_${timestamp}`;
  }

  async getEPSStats(): Promise<{
    total: number;
    activas: number;
    inactivas: number;
    conIPS: number;
    sinIPS: number;
  }> {
    const [total, activas, conIPS] = await Promise.all([
      this.epsRepository.count(),
      this.epsRepository.count({ where: { activa: true } }),
      this.epsRepository
        .createQueryBuilder('eps')
        .leftJoin('eps.ipsAsignadas', 'ips')
        .where('ips.id IS NOT NULL')
        .getCount()
    ]);

    return {
      total,
      activas,
      inactivas: total - activas,
      conIPS,
      sinIPS: total - conIPS
    };
  }
}