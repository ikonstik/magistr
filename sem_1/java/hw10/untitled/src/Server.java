import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

public class Server {
    public static void main(String[] args) throws IOException {
        Selector selector = Selector.open();
        ServerSocketChannel serverChannel = ServerSocketChannel.open();

        serverChannel.configureBlocking(false);
        serverChannel.bind(new InetSocketAddress(5050));

        serverChannel.register(selector, SelectionKey.OP_ACCEPT);

        while (true) {
            selector.select();
            Iterator<SelectionKey> keys = selector.selectedKeys().iterator();

            while (keys.hasNext()) {
                SelectionKey key = keys.next();
                keys.remove();

                if (!key.isValid()) {
                    continue;
                }

                if (key.isAcceptable()) {
                    ServerSocketChannel server = (ServerSocketChannel) key.channel();
                    SocketChannel clientChannel = server.accept();
                    clientChannel.configureBlocking(false);

                    clientChannel.register(selector, SelectionKey.OP_READ | SelectionKey.OP_WRITE);

                    System.out.println("Клиент подключился " + clientChannel.getRemoteAddress());

                } else if (key.isReadable()) {
                    SocketChannel clientChannel = (SocketChannel) key.channel();
                    ByteBuffer buffer = ByteBuffer.allocate(256);

                    try {
                        int bytesRead = clientChannel.read(buffer);

                        if (bytesRead == -1) {
                            clientChannel.close();
                            key.cancel();
                            System.out.println("Клиент отключился");
                        } else if (bytesRead > 0) {
                            buffer.flip();
                            String recieved = StandardCharsets.UTF_8.decode(buffer).toString();
                            System.out.println("Сообщение от клиента " + recieved);
                        }
                    } catch (IOException e) {
                        clientChannel.close();
                        key.cancel();
                        e.printStackTrace();
                    }
                        
                } else if (key.isWritable()) {
                    SocketChannel clientChannel = (SocketChannel) key.channel();

                    try {
                        ByteBuffer buffer = ByteBuffer.wrap("Hello from the server!".getBytes(StandardCharsets.UTF_8));
                        while (buffer.hasRemaining()) {
                            clientChannel.write(buffer);
                        }
                        // После отправки отключаем OP_WRITE чтобы не вызывать постоянно
                        key.interestOps(SelectionKey.OP_READ);
                    } catch (IOException e) {
                        clientChannel.close();
                        key.cancel();
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}

