import { Module } from '@nestjs/common'
import { GithubStrategy } from './github.strategy'
import { ScmStrategyResolver, ScmStrategy } from './scm.interface'
import { BitbucketStrategy } from './bitbucket.strategy'
import { CryptoModule } from '../crypto/crypto.module'
@Module({
  imports: [CryptoModule],
  providers: [
    GithubStrategy,
    BitbucketStrategy,
    {
      provide: ScmStrategyResolver,
      useFactory: (...strategies: ScmStrategy[]) => {
        return new ScmStrategyResolver(strategies)
      },
      inject: [GithubStrategy, BitbucketStrategy]
    }
  ],
  exports: [ScmStrategyResolver]
})
export class ScmModule {}
