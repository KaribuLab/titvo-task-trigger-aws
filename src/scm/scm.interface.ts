import { TaskArgs, TaskSource } from '../task/task.domain'

export interface ScmStrategy {
  supports: (taskSource: TaskSource) => boolean
  handle: (taskArgs: TaskArgs) => Promise<TaskArgs>
}

export class ScmStrategyResolver {
  constructor (private readonly scmStrategies: ScmStrategy[]) {}
  async resolve (taskSource: TaskSource): Promise<ScmStrategy> {
    const strategy = this.scmStrategies.find(strategy => strategy.supports(taskSource))
    if (strategy === undefined) {
      throw new Error(`No strategy found for source: ${taskSource}`)
    }
    return strategy
  }
}
