import { Module } from '@nestjs/common'
import { GithubStrategy } from './github.strategy'
import { ScmStrategyResolver, ScmStrategy } from './scm.interface'
import { BitbucketStrategy } from './bitbucket.strategy'
import { CryptoModule } from '../crypto/crypto.module'
import { CliStrategy } from './cli.strategy'
import { TaskCliFilesModule } from '../task-cli-files/task-cli-files.module'
@Module({
  imports: [CryptoModule, TaskCliFilesModule],
  providers: [
    GithubStrategy,
    BitbucketStrategy,
    CliStrategy,
    {
      provide: ScmStrategyResolver,
      useFactory: (...strategies: ScmStrategy[]) => {
        return new ScmStrategyResolver(strategies)
      },
      inject: [GithubStrategy, BitbucketStrategy, CliStrategy]
    }
  ],
  exports: [ScmStrategyResolver]
})
export class ScmModule {}
