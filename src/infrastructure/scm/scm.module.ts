import { Module } from '@nestjs/common'
import { GithubStrategy } from '@trigger/app/scm/github.strategy'
import { ScmStrategyResolver, ScmStrategy } from '@trigger/app/scm/scm.interface'
import { BitbucketStrategy } from '@trigger/app/scm/bitbucket.strategy'
import { CryptoModule } from '@infrastructure/crypto/crypto.module'
import { CliStrategy } from '@trigger/app/scm/cli.strategy'
import { CliFilesModule } from '@infrastructure/cli-files/cli-files.module'
@Module({
  imports: [CryptoModule, CliFilesModule],
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
