import React,{useState, useEffect} from "react";
import {View, Text, Button, Image, StyleSheet, ScrollView} from "react-native";
import {Left, Right, Container, H1} from "native-base";

const ProductDetails = (props) => {
  const {item} = props.route.params;
  const [currentProduct, setCurrentProduct] = useState(item);
  const [isAvailable, setIsAvailable] = useState(null);

  useEffect(() => {

  }, [])

  return (
    <Container style={styles.container}>
      <ScrollView style={{padding: 8, marginBottom: 80}}>
        <View>
          <Image
            source={{
              uri: item.image ? item.image : "https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png"
            }}
            resizeMode="contain"
            style={styles.image}
          />
        </View>
        <View style={styles.contentWrapper}>
          <H1 style={styles.contentHeader}>{item.name}</H1>
          <Text style={styles.contentText}>{item.brand}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomWraper}>
        <Left>
          <Text style={styles.price}>${item.price}</Text>
        </Left>
        <Right>
          <View style={styles.bottomBtnWrapper}>
            <Button title="Add"/>
          </View>
        </Right>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: "100%"
  },
  imageContainer: {
    padding: 0,
    margin: 0,
    backgroundColor: "white"
  },
  image: {
    width: "100%",
    height: 250,
    marginBottom: 10
  },
  contentWrapper: {
    justifyContent: "center",
    alignItems: "center"
  },
  contentHeader: {
    marginBottom: 10,
    fontWeight: "bold"
  },
  contentText: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold"
  },
  bottomWraper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    backgroundColor: "white"
  },
  price: {
    fontSize: 24,
    color: "red"
  },
  bottomBtnWrapper: {
    width: 60,
  }
})

export default ProductDetails;