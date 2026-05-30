import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

const Banner = () => (
  <View style={styles.banner}>
    <Image
      source={require("@/assets/images/balanzen-banner.png")}
      style={styles.image}
      contentFit="cover"
    />
    <View style={styles.content}>
      <Text style={styles.logo}>BalanZen</Text>
      <Text style={styles.tagline}>
        Reducí el desperdicio alimentario y accedé a productos frescos con
        descuento.
      </Text>
    </View>
  </View>
);

export default Banner;

const styles = StyleSheet.create({
  banner: {
    height: 224,
    backgroundColor: "#F1EFE8",
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: "absolute",
    left: 20,
    top: 20,
    right: "42%",
    bottom: 0,
    justifyContent: "center",
    paddingVertical: 16,
  },
  logo: {
    fontFamily: "TanMeringue",
    fontSize: 40,
    color: "#27500A",
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#27500A",
    lineHeight: 19,
    marginTop: 6,
  },
});
