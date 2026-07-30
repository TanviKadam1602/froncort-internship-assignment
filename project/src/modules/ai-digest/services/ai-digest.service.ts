import { AIDigestRepository, CreateDigestRepoData } from '../repositories/ai-digest.repository';
import { GenerateDigestInputDTO } from '../dtos/ai-digest.dto';
import { AuthenticatedUser } from '../../../middleware/authenticate.middleware';
import { ApiError } from '../../../core/utils/api-error';
import { AIProviderFactory } from '../providers/ai-provider.factory';
import { DigestMetrics } from '../providers/ai-provider.interface';
import { prisma } from '../../../core/database/prisma.client';
import { DigestInterval, NotificationType } from '@prisma/client';
import { DigestPromptTemplate } from '../prompts/digest-prompt.template';

export class AIDigestService {
  constructor(private readonly digestRepo: AIDigestRepository = new AIDigestRepository()) {}

  /**
   * Generates a new AI Progress Digest scoped strictly to actor's active organization.
   */
  async generateDigest(actor: AuthenticatedUser, input: GenerateDigestInputDTO) {
    const orgId = actor.activeOrgId;

    // 1. Calculate Tenant Metrics
    const [totalTickets, openTickets, resolvedTickets, totalPRs, approvedPRs, mergedPRs] = await Promise.all([
      prisma.ticket.count({ where: { orgId, deletedAt: null } }),
      prisma.ticket.count({ where: { orgId, status: 'OPEN', deletedAt: null } }),
      prisma.ticket.count({ where: { orgId, status: 'RESOLVED', deletedAt: null } }),
      prisma.pullRequest.count({ where: { orgId, deletedAt: null } }),
      prisma.pullRequest.count({ where: { orgId, status: 'APPROVED', deletedAt: null } }),
      prisma.pullRequest.count({ where: { orgId, status: 'MERGED', deletedAt: null } }),
    ]);

    const metrics: DigestMetrics = {
      totalTickets,
      openTickets,
      resolvedTickets,
      totalPRs,
      approvedPRs,
      mergedPRs,
    };

    // 2. Fetch Recent Activities for Context (Strictly Scoped)
    const recentTickets = await prisma.ticket.findMany({
      where: { orgId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { title: true, status: true },
    });

    const contextText = `Recent tickets: ${recentTickets.map((t) => `${t.title} [${t.status}]`).join('; ')}`;

    // 3. Build Dynamic Prompt via Prompt Template
    const promptText = DigestPromptTemplate.buildPrompt(metrics, contextText);

    // 4. Call Configured AI Provider (OpenAI or Gemini via Factory)
    const aiProvider = AIProviderFactory.getProvider();
    const summaryText = await aiProvider.generateDigestSummary(metrics, promptText);

    // 5. Save AIDigest Record
    const repoData: CreateDigestRepoData = {
      userId: actor.userId,
      orgId,
      summaryText,
      metricsSnapshot: metrics,
      intervalType: input.intervalType ?? DigestInterval.DAILY,
    };

    const digest = await this.digestRepo.createDigest(repoData);

    // 6. Create Notification
    await prisma.notification.create({
      data: {
        userId: actor.userId,
        orgId,
        type: NotificationType.DIGEST_READY,
        title: 'New AI Progress Digest Ready',
        message: 'Your AI executive progress summary has been generated.',
        linkUrl: `/ai/digests/${digest.id}`,
      },
    });

    return digest;
  }

  /**
   * Regenerates an existing AI Progress Digest with fresh metrics.
   */
  async regenerateDigest(actor: AuthenticatedUser, id: string) {
    const existing = await this.getDigestById(actor, id);
    if (!existing) {
      throw ApiError.notFound('AI Digest not found', 'DIGEST_NOT_FOUND');
    }

    return this.generateDigest(actor, { intervalType: existing.intervalType });
  }

  /**
   * Retrieves a single AI Digest by ID.
   */
  async getDigestById(actor: AuthenticatedUser, id: string) {
    const digest = await this.digestRepo.findDigestById(id, actor.activeOrgId, actor.userId);
    if (!digest) {
      throw ApiError.notFound('AI Digest not found', 'DIGEST_NOT_FOUND');
    }
    return digest;
  }

  /**
   * Lists AI Digests for user with pagination.
   */
  async listDigests(actor: AuthenticatedUser, page = 1, limit = 10) {
    return this.digestRepo.findDigestsForUser(actor.userId, actor.activeOrgId, page, limit);
  }
}
