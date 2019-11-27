import React, { useState } from 'react'
import p from 'prop-types'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'
import { Link, Redirect } from 'react-router-dom'
import _ from 'lodash-es'

import PageActions from '../util/PageActions'
import OtherActions from '../util/OtherActions'
import DetailsPage from '../details/DetailsPage'
import ServiceEditDialog from './ServiceEditDialog'
import ServiceDeleteDialog from './ServiceDeleteDialog'
import { QuerySetFavoriteButton } from '../util/QuerySetFavoriteButton'
import Spinner from '../loading/components/Spinner'
import { GenericError, ObjectNotFound } from '../error-pages'
import ServiceOnCallList from './ServiceOnCallList'

const query = gql`
  fragment TitleQuery on Service {
    id
    name
    description
  }

  query serviceDetailsQuery($serviceID: ID!) {
    service(id: $serviceID) {
      ...TitleQuery
      ep: escalationPolicy {
        id
        name
      }
      heartbeatMonitors {
        id
        lastState
      }
      onCallUsers {
        userID
        userName
        stepNumber
      }
    }

    alerts(
      input: {
        filterByStatus: [StatusAcknowledged, StatusUnacknowledged]
        filterByServiceID: [$serviceID]
        first: 1
      }
    ) {
      nodes {
        id
        status
      }
    }
  }
`

const hbStatus = h => {
  if (!h || !h.length) return null
  if (h.every(m => m.lastState === 'healthy')) return 'ok'
  if (h.some(m => m.lastState === 'unhealthy')) return 'err'
  return 'warn'
}

const alertStatus = a => {
  if (!a) return null
  if (!a.length) return 'ok'
  if (a[0].status === 'StatusUnacknowledged') return 'err'
  return 'warn'
}

export default function ServiceDetails({ serviceID }) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { loading, error, data } = useQuery(query, {
    variables: { serviceID },
    returnPartialData: true,
  })

  const service = _.get(data, 'service', null)
  const alerts = _.get(data, 'alerts.nodes', null)

  if (loading) return <Spinner />
  if (error) return <GenericError error={error.message} />

  if (!service) {
    return showDeleteDialog ? (
      <Redirect to='/services' push />
    ) : (
      <ObjectNotFound />
    )
  }

  return (
    <React.Fragment>
      <PageActions>
        <QuerySetFavoriteButton serviceID={serviceID} />
        <OtherActions
          actions={[
            {
              label: 'Edit Service',
              onClick: () => setShowEditDialog(true),
            },
            {
              label: 'Delete Service',
              onClick: () => setShowDeleteDialog(true),
            },
          ]}
        />
      </PageActions>
      <DetailsPage
        title={service.name}
        details={service.description}
        titleFooter={
          <div>
            Escalation Policy:{' '}
            {service.ep ? (
              <Link to={`/escalation-policies/${service.ep.id}`}>
                {service.ep.name}
              </Link>
            ) : (
              <Spinner text='Looking up policy...' />
            )}
          </div>
        }
        links={[
          {
            label: 'Alerts',
            status: alertStatus(alerts),
            url: 'alerts',
          },
          {
            label: 'Heartbeat Monitors',
            url: 'heartbeat-monitors',
            status: hbStatus(service.heartbeatMonitors),
          },
          { label: 'Integration Keys', url: 'integration-keys' },
          { label: 'Labels', url: 'labels' },
        ]}
        pageFooter={<ServiceOnCallList serviceID={serviceID} />}
      />
      {showEditDialog && (
        <ServiceEditDialog
          onClose={() => setShowEditDialog(false)}
          serviceID={serviceID}
        />
      )}
      {showDeleteDialog && (
        <ServiceDeleteDialog
          onClose={() => setShowDeleteDialog(false)}
          serviceID={serviceID}
        />
      )}
    </React.Fragment>
  )
}

ServiceDetails.propTypes = {
  serviceID: p.string.isRequired,
}
