import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import ConnectWallet from 'components/common/ConnectWallet'
import ConnectMainNet from 'components/common/ConnectMainNet'
import LockPanel from 'components/common/panels/LockPanel'
import EnableTokenPanel from 'components/common/panels/EnableTokenPanel'
import TimelineProgress from 'components/common/TimelineProgress'
import LogoAndText from 'components/common/LogoAndText'
import TokenValue from 'components/common/TokenValue'
import icon from 'assets/pngs/NECwithoutText.png'
import { deployed } from 'config.json'
import BatchesTable from 'components/tables/BatchesTable'
import UserLocksTable from 'components/tables/UserLocksTable'
import LoadingCircle from '../../common/LoadingCircle'
import { RootStore } from 'stores/Root'
import ExtendLockPanel from 'components/common/panels/ExtendLockPanel'

const LockNECWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  max-height: 500px;
`

const DetailsWrapper = styled.div`
  width: 80%;
  height: 364px;
  border-right: 1px solid var(--border);
`

const TableHeaderWrapper = styled.div`
  height: 103px
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 24px;
  border-bottom: 1px solid var(--border);
`

const TableTabEnumWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 103px
`

const TableTabButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 7.5px 14px;
  margin-left: 12px;
  background: var(--background);
  border: 1px solid var(--active-border);
  cursor: pointer;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 18px;
  color: var(--white-text);
`

const InactiveTableTabButton = styled(TableTabButton)`
  color: var(--inactive-header-text);
  border: 1px solid var(--inactive-border);
`

const ActionsWrapper = styled.div`
  width: 425px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
`

const ActionsHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  margin: 0px 24px;
  color: var(--white-text);
  border-bottom: 1px solid var(--border);
`

enum TabEnum {
  YOUR_LOCKS,
  ALL_PERIODS
}

const status = {
  NOT_STARTED: 0
}

type Props = {
  root: RootStore
}

type State = {
  currentTab: TabEnum
}

@inject('root')
@observer
class LockNEC extends React.Component<any, State> {
  constructor(props) {
    super(props)

    this.state = {
      currentTab: TabEnum.ALL_PERIODS
    }
  }

  setCurrentTab(value) {
    this.setState({ currentTab: value })
  }

  /*
  Remaining Time
  IF > 1 day
    x days, y hours
  IF < 1 day && > 1 hour
    y hours, z minutes
  IF < 1 hour && > 1 min
    y minutes, z minutes
  IF < 1 min && > 0 seconds
  */
  getTimerVisuals() {
    const { lockNECStore, timeStore } = this.props.root as RootStore

    const currentBatch = lockNECStore.getActiveLockingBatch()
    const finalBatch = lockNECStore.getFinalBatchIndex()
    const batchLength = lockNECStore.staticParams.batchTime
    const isLockingStarted = lockNECStore.isLockingStarted()
    const isLockingEnded = lockNECStore.isLockingEnded()
    const numBatches = lockNECStore.staticParams.numLockingBatches
    const finalBatchIndex = lockNECStore.getFinalBatchIndex()

    let batchPercentage = 0
    let batchTimer = '...'
    let batchStatus = 0
    let batchTitle = `Current Batch: ${currentBatch} of ${finalBatchIndex}`

    let prefix = 'Next starts in'

    if (!isLockingStarted) {
      prefix = 'First batch starts in'
      batchTitle = "Locking has not started"
    }


    if (currentBatch === finalBatch && !isLockingEnded) {
      prefix = 'Last batch ends in'
    }

    // Locking In Progress
    if (!isLockingEnded) {
      const timeUntilNextBatch = Number(lockNECStore.getTimeUntilNextBatch())
      batchPercentage = (timeUntilNextBatch / batchLength) * 100
      batchTimer = `${prefix}, ${timeUntilNextBatch} seconds`
    }

    // Locking Ended
    if (isLockingEnded) {
      batchPercentage = 100
      batchTimer = ''
      batchTitle = 'Locking has ended'
    }

    return {
      batchPercentage,
      batchTimer,
      batchStatus,
      batchTitle
    }
  }

  renderTable(currentTab) {
    if (currentTab === TabEnum.YOUR_LOCKS) {
      return (
        <UserLocksTable />
      )
    } else if (currentTab === TabEnum.ALL_PERIODS) {
      return (
        < BatchesTable highlightTopRow />
      )
    }
  }

  TabButton = (currentTab, tabType, tabText) => {
    if (currentTab === tabType) {
      return (
        <TableTabButton onClick={() => this.setCurrentTab(tabType)}>
          {tabText}
        </TableTabButton>
      )
    } else {
      return (
        <InactiveTableTabButton onClick={() => this.setCurrentTab(tabType)}>
          {tabText}
        </InactiveTableTabButton>
      )
    }
  }

  render() {
    const { lockNECStore, providerStore, tokenStore, timeStore, txTracker } = this.props.root as RootStore
    const { currentTab } = this.state
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const spenderAddress = deployed.ContinuousLocking4Reputation

    // Check Loading Conditions
    const staticParamsLoaded = lockNECStore.areStaticParamsLoaded()
    const hasBalance = tokenStore.hasBalance(necTokenAddress, userAddress)
    const hasAllowance = tokenStore.hasAllowance(necTokenAddress, userAddress, spenderAddress)


    //TODO Update this to proper logic for handling ConnectWallet and ConnectMainNet Screens
    // if (!staticParamsLoaded || !hasBalance || !hasAllowance) {
    if (true) {
      // return <ConnectMainNet />
      return <ConnectWallet />
      // return (<LoadingCircle instruction={'Loading...'} subinstruction={''} />)
    }

    const tokenApproved = tokenStore.hasMaxApproval(necTokenAddress, userAddress, spenderAddress)
    const approvePending = tokenStore.isApprovePending(necTokenAddress, userAddress, spenderAddress)
    const lockPending = txTracker.isLockActionPending()
    const extendPending = txTracker.isExtendLockActionPending()

    const isLockingStarted = lockNECStore.isLockingStarted()
    const isLockingEnded = lockNECStore.isLockingEnded()

    const userHasLocks = lockNECStore.userHasLocks(userAddress)
    const necBalance = tokenStore.getBalance(necTokenAddress, userAddress)
    const now = timeStore.currentTime

    const timerVisuals = this.getTimerVisuals()

    const { batchPercentage, batchTimer, batchTitle } = timerVisuals

    return (
      <LockNECWrapper>
        <DetailsWrapper>
          <TableHeaderWrapper>
            <TimelineProgress
              value={batchPercentage}
              title={batchTitle}
              subtitle={batchTimer}
              width="28px"
              height="28px"
              displayTooltip={true}
            />
            {isLockingStarted ?
              <TableTabEnumWrapper>
                {this.TabButton(currentTab, TabEnum.ALL_PERIODS, "All Batches")}
                {this.TabButton(currentTab, TabEnum.YOUR_LOCKS, "Your Locks")}
              </TableTabEnumWrapper>
              : <React.Fragment></React.Fragment>
            }
          </TableHeaderWrapper>
          {this.renderTable(currentTab)}
        </DetailsWrapper>
        <ActionsWrapper>
          <ActionsHeader>
            <LogoAndText icon={icon} text="Nectar" />
            <TokenValue weiValue={necBalance} />
          </ActionsHeader>
          < React.Fragment >
            {tokenApproved === false ?
              <EnableTokenPanel
                instruction="Enable NEC for locking"
                subinstruction="-"
                buttonText="Enable NEC"
                userAddress={userAddress}
                tokenAddress={necTokenAddress}
                spenderAddress={spenderAddress}
                enabled={tokenApproved}
                pending={approvePending}
              />
              :
              currentTab === TabEnum.ALL_PERIODS ?
                <LockPanel
                  buttonText="Lock NEC"
                  userAddress={userAddress}
                  enabled={isLockingStarted && !isLockingEnded}
                  pending={lockPending}
                />
                :
                <ExtendLockPanel
                  buttonText="Extend Lock"
                  userAddress={userAddress}
                  enabled={isLockingStarted && !isLockingEnded}
                  pending={extendPending}
                  hasLocks={userHasLocks}
                />
            }
          </React.Fragment >
        </ActionsWrapper>
      </LockNECWrapper >
    )
  }
}

export default LockNEC
