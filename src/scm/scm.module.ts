import { Module } from '@nestjs/common'
import { GithubStrategy } from './github.strategy'
import { ScmStrategyResolver, ScmStrategy } from './scm.interface'
import { BitbucketStrategy } from './bitbucket.strategy'
@Module({
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
