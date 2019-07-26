import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import SchemaLogo from '../../../assets/images/schema.png';

const useStyles = makeStyles({
  card: {
    height: 130,
    width: 135
  },
  pos: {
    marginBottom: 0
  }
});

const openVoyager = () => {
  window.open('http://localhost:5000/voyager', '_blank', 'nodeIntegration=no');
};

function VoyagerDisplayCard() {
  const classes = useStyles();

  return (
    <Button onClick={() => openVoyager()} size="large" align="center">
      <Card className={classes.card}>
        <CardContent>
          <img src={SchemaLogo} height="50%" width="50%" />

          <Typography
            className={classes.pos}
            align="center"
            variant="body2"
            color="textSecondary"
          >
            *Visualize Schema
          </Typography>
        </CardContent>
        <CardActions />
      </Card>
    </Button>
  );
}

export default VoyagerDisplayCard;
