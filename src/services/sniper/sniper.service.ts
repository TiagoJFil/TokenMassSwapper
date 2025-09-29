import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { SniperRequestEntity } from '../../model/entities/sniper-request.entity';
import type { SniperFilterParameters } from '../types';
import { WalletManagerEntity } from 'src/model/entities/wallet-manager.entity';
import { NESTJS } from '../../utils/constants';

@Injectable()
export class SniperService {
  private readonly logger = new Logger(SniperService.name);
  private worker: Worker;
  isWorkerRunning = false;

  constructor(
    @InjectRepository(SniperRequestEntity)
    private readonly sniperRequestRepository: Repository<SniperRequestEntity>,
    @InjectRepository(WalletManagerEntity)
    private readonly walletManagerRepository: Repository<WalletManagerEntity>,
    @Inject(NESTJS.IS_WORKER_PROVIDER_KEY) //TODO make the provider
    private readonly isWorkerNode: boolean,
  ) {
    this.checkIfHasActiveRequests().then(
      (hasListeners) => {
        console.log('Has listeners:', hasListeners);

        if (hasListeners) {
          this.startWorkerIfNeeded()
        }
      },
    )
  }

  private startWorker() {
    const pathToWorker = `${__dirname}/test.worker.js`
    this.worker = new Worker(pathToWorker, { type: 'classic' });

    this.worker.onmessage = async (data: MessageEvent) => {
      this.logger.log('Data received from worker:', data.data);
    };

    this.worker.onmessageerror = (error) => {
      this.logger.error('Worker error:', error);
    };

  }

  private async checkIfHasActiveRequests(): Promise<boolean> {
    const request = await this.sniperRequestRepository.findOne({ where: { active: true } });
    return !!request;
  }

  private async startWorkerIfNeeded() {
    if (this.isWorkerNode && !this.isWorkerRunning) {
      this.startWorker();
      this.isWorkerRunning = true;
    }
  }


  async submitRequest(uid: number, parameters : SniperFilterParameters): Promise<SniperRequestEntity> {
    const walletManager = await this.walletManagerRepository.findOne({ where: { id: uid } });
    if (!walletManager) {
      throw new Error(`Wallet manager with ID ${uid} not found`);
    }
    if (!this.isWorkerRunning) {

    }
    const request = new SniperRequestEntity();
    console.log(parameters)
    request.buy_amount = parameters.buy_amount;
    request.any = parameters.any;
    request.policyID = parameters.policyID;
    request.ticker = parameters.ticker;
    request.description = parameters.description;
    request.launchType = parameters.launchType;
    request.devPercentage = parameters.devPercentage;
    request.twitter = parameters.socials?.twitter;
    request.telegram = parameters.socials?.telegram;
    request.discord = parameters.socials?.discord;
    request.website = parameters.socials?.website;
    request.slippage = parameters.slippage;
    request.walletManager = walletManager
    return this.sniperRequestRepository.save(request);
  }

  async cancelRequest(requestId: number): Promise<SniperRequestEntity | null> {
    const request = await this.sniperRequestRepository.findOne({ where: { id: requestId, active: true } });
    if (!request) {
      return null;
    }
    request.active = false;
    return await this.sniperRequestRepository.save(request);
  }

}