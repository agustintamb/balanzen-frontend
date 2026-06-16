import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { Publication } from "@/api/publications/publications.types";
import AppRefreshControl from "@/components/ui/AppRefreshControl";
import DetailBody from "./DetailBody";
import DetailImageCarousel from "./DetailImageCarousel";
import DetailInfoCard from "./DetailInfoCard";
import type { InfoItem } from "./utils";

interface ProductDetailLayoutProps {
  publication: Publication;
  onBack: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  headerActions?: React.ReactNode;
  counterpart: React.ReactNode;
  infoItems: InfoItem[];
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

const ProductDetailLayout = ({
  publication,
  onBack,
  isRefreshing,
  onRefresh,
  headerActions,
  counterpart,
  infoItems,
  footer,
  children,
}: ProductDetailLayoutProps) => (
  <View className="flex-1 bg-white">
    <StatusBar style="light" />

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <DetailImageCarousel
        photos={publication.photos}
        onBack={onBack}
        rightActions={headerActions}
      />

      <View className="gap-5 px-5 pt-5">
        {counterpart}
        <DetailBody publication={publication} />
        <DetailInfoCard items={infoItems} />
      </View>
    </ScrollView>

    {footer}
    {children}
  </View>
);

export default ProductDetailLayout;
