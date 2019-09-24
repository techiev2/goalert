import React, { useState } from 'react'
import Search from '../util/Search'
import IconButton from '@material-ui/core/IconButton'
import SpeedDial from '../util/SpeedDial'
import Right from '@material-ui/icons/ChevronRight'
import Left from '@material-ui/icons/ChevronLeft'
import { VpnKey as ServiceIcon, Label as LabelIcon } from '@material-ui/icons'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Card from '@material-ui/core/Card'
import Chip from '@material-ui/core/Chip'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { Chance } from 'chance'
import { ListItemSecondaryAction } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import { ServiceSelect } from '../selection/ServiceSelect'
import FilterContainer from '../util/FilterContainer'
import gql from 'graphql-tag'
import QueryList from '../lists/QueryList'
const c = new Chance()

const query = gql`
  query servicesQuery($input: ServiceSearchOptions) {
    data: services(input: $input) {
      nodes {
        id
        name
        description
        isFavorite
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const useStyles = makeStyles(theme => ({
  flex: {
    flexGrow: 1,
  },
  activeButton: {
    boxShadow: 'inset 0px 0px 5px ' + theme.palette.secondary['500'],
  },
}))

export default function MockServicesList() {
  const classes = useStyles()
  const [showServicesToggle, setShowServicesToggle] = useState(true)

  let services1 = []
  let services2 = []
  let services3 = []
  let services4 = []

  const key = 'servicenow/AssignmentGroup'
  const labelVal1 = 'Engineering Practices - Measurement'
  const labelVal2 = 'Solution Portfolio - Merch'
  const labelVal3 = 'ENG - Client Tech'

  for (let i = 0; i < 5; i++) {
    services1.push({
      id: c.guid(),
      name: c.word({ capitalize: true }) + ' ' + c.word({ capitalize: true }),
      description: c.sentence(),
      label: {
        key,
        value: labelVal1,
      },
    })
  }
  for (let i = 0; i < 3; i++) {
    services2.push({
      id: c.guid(),
      name: c.word({ capitalize: true }) + ' ' + c.word({ capitalize: true }),
      description: c.sentence(),
      label: {
        key,
        value: labelVal2,
      },
    })
  }
  for (let i = 0; i < 4; i++) {
    services3.push({
      id: c.guid(),
      name: c.word({ capitalize: true }) + ' ' + c.word({ capitalize: true }),
      description: c.sentence(),
      label: {
        key,
        value: labelVal3,
      },
    })
  }
  for (let i = 0; i < 5; i++) {
    services4.push({
      id: c.guid(),
      name: c.word({ capitalize: true }) + ' ' + c.word({ capitalize: true }),
      description: c.sentence(),
      label: null,
    })
  }

  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <Grid item>
          <ButtonGroup>
            <Button
              className={showServicesToggle ? classes.activeButton : null}
              onClick={() => setShowServicesToggle(true)}
            >
              <ServiceIcon style={{ marginRight: '0.5em' }} />
              All Services
            </Button>
            <Button
              className={showServicesToggle ? null : classes.activeButton}
              onClick={() => setShowServicesToggle(false)}
            >
              <LabelIcon style={{ marginRight: '0.5em' }} />
              Label Groups
            </Button>
          </ButtonGroup>
        </Grid>

        <Grid item className={classes.flex} />

        <Grid item>
          <FilterContainer>
            <Grid item xs={12}>
              <ServiceSelect label='Select label key' />
            </Grid>
            <Grid item xs={12}>
              <ServiceSelect label='Select label value' />
            </Grid>
          </FilterContainer>
        </Grid>

        <Grid item>
          <Search placeholder='Search services' />
        </Grid>

        <Grid item>
          <IconButton>
            <Left />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton>
            <Right />
          </IconButton>
        </Grid>

        {renderContent()}

        <Grid item className={classes.flex} />

        <Grid item>
          <IconButton>
            <Left />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton>
            <Right />
          </IconButton>
        </Grid>
      </Grid>

      <SpeedDial
        label='service'
        actions={[
          {
            icon: <ServiceIcon />,
            onClick: () => {},
            label: 'Create Service',
          },
          {
            icon: <LabelIcon />,
            onClick: () => {},
            label: 'Create Label Group',
          },
        ]}
      />
    </React.Fragment>
  )

  function renderContent() {
    if (showServicesToggle) {
      return (
        <QueryList
          query={query}
          variables={{ input: { favoritesFirst: true } }}
          mapDataNode={n => ({
            title: n.name,
            subText: n.description,
            url: n.id,
            isFavorite: n.isFavorite,
          })}
        />
      )
    } else {
      return (
        <React.Fragment>
          <Grid item xs={12}>
            <Typography
              component='h2'
              color='textSecondary'
              variant='h5'
              style={{ marginBottom: '0.25em' }}
            >
              {labelVal1}
            </Typography>
            <Card>
              <List>
                {services1.map(service => (
                  <ListItem button key={service.id}>
                    <ListItemText
                      primary={service.name}
                      secondary={service.description}
                    />
                    {service.label && (
                      <ListItemSecondaryAction>
                        <Chip
                          avatar={
                            <Avatar>
                              <LabelIcon />
                            </Avatar>
                          }
                          label={service.label.key}
                        />
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography
              component='h2'
              color='textSecondary'
              variant='h5'
              style={{ marginBottom: '0.25em' }}
            >
              {labelVal2}
            </Typography>
            <Card>
              <List>
                {services2.map(service => (
                  <ListItem button key={service.id}>
                    <ListItemText
                      primary={service.name}
                      secondary={service.description}
                    />
                    {service.label && (
                      <ListItemSecondaryAction>
                        <Chip
                          avatar={
                            <Avatar>
                              <LabelIcon />
                            </Avatar>
                          }
                          label={service.label.key}
                        />
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography
              component='h2'
              color='textSecondary'
              variant='h5'
              style={{ marginBottom: '0.25em' }}
            >
              {labelVal3}
            </Typography>
            <Card>
              <List>
                {services3.map(service => (
                  <ListItem button key={service.id}>
                    <ListItemText
                      primary={service.name}
                      secondary={service.description}
                    />
                    {service.label && (
                      <ListItemSecondaryAction>
                        <Chip
                          avatar={
                            <Avatar>
                              <LabelIcon />
                            </Avatar>
                          }
                          label={service.label.key}
                        />
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography
              component='h2'
              color='textSecondary'
              variant='h5'
              style={{ marginBottom: '0.25em' }}
            >
              No Labels
            </Typography>
            <Card>
              <List>
                {services4.map(service => (
                  <ListItem button key={service.id}>
                    <ListItemText
                      primary={service.name}
                      secondary={service.description}
                    />
                    {service.label && (
                      <ListItemSecondaryAction>
                        <Chip
                          avatar={
                            <Avatar>
                              <LabelIcon />
                            </Avatar>
                          }
                          label={service.label.key}
                        />
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        </React.Fragment>
      )
    }
  }
}
